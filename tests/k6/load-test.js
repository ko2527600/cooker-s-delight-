/**
 * Load Test — measures application capacity under realistic user traffic.
 *
 * Simulates a typical busy evening at Cookers Delight:
 *  - Customers browse the menu and location pages.
 *  - A fraction of users reach the reservation flow.
 *  - A smaller fraction places a QR-table order.
 *
 * Run:
 *   k6 run tests/k6/load-test.js \
 *     -e API_URL=https://api.cookersdelight.com \
 *     -e API_TOKEN=your_token_here
 *
 * Thresholds (SLOs):
 *   - 95th-percentile response time < 800 ms
 *   - Error rate < 1 %
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Custom metrics ──────────────────────────────────────────────────────────
const errorRate       = new Rate('errors');
const menuLoadTime    = new Trend('menu_load_time', true);
const locationTime    = new Trend('location_load_time', true);
const reservationTime = new Trend('reservation_create_time', true);
const apiErrors       = new Counter('api_errors');

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL  = __ENV.API_URL   || 'http://localhost:8000/api';
const API_TOKEN = __ENV.API_TOKEN || '';

const HEADERS = {
  Authorization: `Bearer ${API_TOKEN}`,
  Accept:        'application/json',
  'Content-Type': 'application/json',
};

// ─── Load profile ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '1m',  target: 10  }, // ramp-up: 0 → 10 VUs over 1 min
    { duration: '3m',  target: 50  }, // ramp-up: 10 → 50 VUs (busy period)
    { duration: '5m',  target: 50  }, // steady state: 50 concurrent users
    { duration: '2m',  target: 100 }, // peak: 100 concurrent users
    { duration: '5m',  target: 100 }, // hold peak for 5 min
    { duration: '2m',  target: 0   }, // ramp-down
  ],
  thresholds: {
    http_req_duration:    ['p(95)<800'],  // 95 % of requests under 800 ms
    http_req_failed:      ['rate<0.01'],  // fewer than 1 % failures
    errors:               ['rate<0.01'],
    menu_load_time:       ['p(95)<1000'],
    location_load_time:   ['p(95)<600'],
    reservation_create_time: ['p(99)<2000'],
  },
};

// ─── Scenario helpers ─────────────────────────────────────────────────────────

function browseMenu() {
  group('Browse Menu', () => {
    // Fetch all categories
    const catRes = http.get(`${BASE_URL}/categories?status=true`, { headers: HEADERS });
    check(catRes, { 'categories 200': (r) => r.status === 200 });
    errorRate.add(catRes.status !== 200);

    sleep(0.5);

    // Fetch menu items
    const start = Date.now();
    const menuRes = http.get(`${BASE_URL}/menus?enabled=true&pageLimit=100`, { headers: HEADERS });
    menuLoadTime.add(Date.now() - start);

    const menuOk = check(menuRes, {
      'menu 200': (r) => r.status === 200,
      'menu has data': (r) => {
        try { return Array.isArray(JSON.parse(r.body).data); } catch { return false; }
      },
    });
    if (!menuOk) apiErrors.add(1);
    errorRate.add(menuRes.status !== 200);
  });
}

function viewLocations() {
  group('View Locations', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/locations?status=true`, { headers: HEADERS });
    locationTime.add(Date.now() - start);

    const ok = check(res, {
      'locations 200': (r) => r.status === 200,
      'locations not empty': (r) => {
        try { return JSON.parse(r.body).data.length > 0; } catch { return false; }
      },
    });
    if (!ok) apiErrors.add(1);
    errorRate.add(res.status !== 200);

    sleep(0.3);

    // Drill into first location
    try {
      const locations = JSON.parse(res.body).data;
      if (locations && locations.length > 0) {
        const detailRes = http.get(
          `${BASE_URL}/locations/${locations[0].location_id}`,
          { headers: HEADERS }
        );
        check(detailRes, { 'location detail 200': (r) => r.status === 200 });
        errorRate.add(detailRes.status !== 200);
      }
    } catch (_) {}
  });
}

function checkAnnouncements() {
  group('Announcements', () => {
    const res = http.get(`${BASE_URL}/announcements?active=true`, { headers: HEADERS });
    check(res, { 'announcements 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });
}

function checkPrepTimes() {
  group('Prep Times', () => {
    const res = http.get(`${BASE_URL}/cd/prep-times`, { headers: HEADERS });
    check(res, { 'prep-times 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });
}

function makeReservation() {
  group('Make Reservation', () => {
    // Check available slots first
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const futureDate = date.toISOString().split('T')[0];

    const slotsRes = http.get(
      `${BASE_URL}/reservations/timeslots?date=${futureDate}&guests=2&location_id=1`,
      { headers: HEADERS }
    );
    check(slotsRes, { 'timeslots 200': (r) => r.status === 200 });

    sleep(1);

    // Create reservation
    const payload = JSON.stringify({
      first_name:   'Load',
      last_name:    'Tester',
      email:        `load${Date.now()}@test.cookersdelight.com`,
      telephone:    '+233200000000',
      guest_num:    2,
      reserve_date: futureDate,
      reserve_time: '13:00',
      location_id:  1,
      comment:      'Load test reservation',
    });

    const start  = Date.now();
    const resRes = http.post(`${BASE_URL}/reservations`, payload, { headers: HEADERS });
    reservationTime.add(Date.now() - start);

    check(resRes, {
      'reservation 201': (r) => r.status === 201,
    });
    errorRate.add(resRes.status !== 201);
  });
}

// ─── Main virtual user scenario ───────────────────────────────────────────────

export default function () {
  // All VUs: check announcements and browse menu
  checkAnnouncements();
  sleep(0.2);

  viewLocations();
  sleep(0.3);

  browseMenu();
  sleep(1);

  // 30 % of VUs also check prep times
  if (Math.random() < 0.30) {
    checkPrepTimes();
    sleep(0.5);
  }

  // 15 % of VUs proceed to reserve a table
  if (Math.random() < 0.15) {
    makeReservation();
    sleep(2);
  }

  // Think time: simulate reading the page between actions
  sleep(Math.random() * 3 + 1);
}

// ─── Lifecycle hooks ──────────────────────────────────────────────────────────

export function handleSummary(data) {
  return {
    'tests/k6/results/load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const indent = opts.indent || '';
  const lines  = [`\n${indent}=== Load Test Summary ===`];
  const m      = data.metrics || {};

  const fmt = (name, metric) => {
    if (!metric) return null;
    if (metric.type === 'trend') {
      return `${indent}  ${name}: avg=${metric.values.avg?.toFixed(0)}ms  p95=${metric.values['p(95)']?.toFixed(0)}ms`;
    }
    if (metric.type === 'rate') {
      return `${indent}  ${name}: ${(metric.values.rate * 100).toFixed(2)}%`;
    }
    if (metric.type === 'counter') {
      return `${indent}  ${name}: ${metric.values.count}`;
    }
    return null;
  };

  [
    ['http_req_duration',       m.http_req_duration],
    ['menu_load_time',          m.menu_load_time],
    ['location_load_time',      m.location_load_time],
    ['reservation_create_time', m.reservation_create_time],
    ['errors (rate)',           m.errors],
    ['api_errors (count)',      m.api_errors],
  ].forEach(([name, metric]) => {
    const line = fmt(name, metric);
    if (line) lines.push(line);
  });

  return lines.join('\n') + '\n';
}
