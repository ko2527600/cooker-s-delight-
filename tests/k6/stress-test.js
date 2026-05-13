/**
 * Stress Test — deliberately pushes the API beyond its normal capacity to
 * discover the breaking point and verify graceful degradation.
 *
 * Key goals:
 *  1. Find the VU count at which error rate exceeds 5 %.
 *  2. Confirm the server recovers after load is removed.
 *  3. Verify that no endpoint returns 500 under any load level.
 *  4. Measure how latency degrades as concurrency increases.
 *
 * Run:
 *   k6 run tests/k6/stress-test.js \
 *     -e API_URL=https://api.cookersdelight.com \
 *     -e API_TOKEN=your_token_here
 *
 * WARNING: Run only against non-production or with explicit capacity-test
 * permission. This will generate significantly more traffic than normal.
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ─── Custom metrics ──────────────────────────────────────────────────────────
const errorRate        = new Rate('stress_errors');
const serverErrors     = new Counter('server_5xx_errors');
const timeoutErrors    = new Counter('timeout_errors');
const menuLatency      = new Trend('stress_menu_latency', true);
const reserveLatency   = new Trend('stress_reserve_latency', true);
const webhookLatency   = new Trend('stress_webhook_latency', true);

// ─── Configuration ────────────────────────────────────────────────────────────
const BASE_URL  = __ENV.API_URL        || 'http://localhost:8000/api';
const API_TOKEN = __ENV.API_TOKEN      || '';
const WH_SECRET = __ENV.PAYSTACK_SECRET || 'test_secret';

const HEADERS = {
  Authorization:  `Bearer ${API_TOKEN}`,
  Accept:         'application/json',
  'Content-Type': 'application/json',
};

// ─── Stress profile ───────────────────────────────────────────────────────────
// Escalating spikes to find the breaking point, then a recovery phase.
export const options = {
  stages: [
    { duration: '1m',  target: 50   }, // warm-up
    { duration: '2m',  target: 100  }, // 2× normal peak
    { duration: '2m',  target: 200  }, // 4× normal peak
    { duration: '2m',  target: 300  }, // 6× normal peak — stress zone
    { duration: '2m',  target: 400  }, // 8× normal peak — near-breaking point
    { duration: '2m',  target: 500  }, // maximum pressure
    { duration: '3m',  target: 500  }, // hold at maximum
    { duration: '3m',  target: 0    }, // ramp-down — measure recovery
  ],
  thresholds: {
    // Stress thresholds are more lenient than load — we expect degradation
    http_req_duration: ['p(95)<3000', 'p(99)<6000'], // under stress: 3 s p95
    http_req_failed:   ['rate<0.10'],                 // tolerate up to 10 % failure
    stress_errors:     ['rate<0.15'],
    server_5xx_errors: ['count<100'],                 // 500s must be very rare
  },
};

// ─── Scenario helpers ─────────────────────────────────────────────────────────

function stressMenuEndpoints() {
  group('Stress: Menu + Categories (read-heavy)', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/menus?enabled=true&pageLimit=100`, {
      headers: HEADERS,
      timeout: '10s',
    });
    menuLatency.add(Date.now() - start);

    if (res.status >= 500) serverErrors.add(1);
    if (res.status === 0)  timeoutErrors.add(1);

    const ok = check(res, {
      'menu not 500': (r) => r.status < 500,
      'menu not timeout': (r) => r.status !== 0,
    });
    errorRate.add(!ok);
  });
}

function stressLocationEndpoint() {
  group('Stress: Locations (read-heavy)', () => {
    const res = http.get(`${BASE_URL}/locations?status=true`, {
      headers: HEADERS,
      timeout: '10s',
    });

    if (res.status >= 500) serverErrors.add(1);
    const ok = check(res, { 'locations not 500': (r) => r.status < 500 });
    errorRate.add(!ok);
  });
}

function stressPrepTimes() {
  group('Stress: Prep Times (read-heavy)', () => {
    const res = http.get(`${BASE_URL}/cd/prep-times`, {
      headers: HEADERS,
      timeout: '10s',
    });
    if (res.status >= 500) serverErrors.add(1);
    check(res, { 'prep-times not 500': (r) => r.status < 500 });
    errorRate.add(res.status >= 500 || res.status === 0);
  });
}

function stressReservations() {
  group('Stress: Create Reservations (write-heavy)', () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    const futureDate = date.toISOString().split('T')[0];

    const payload = JSON.stringify({
      first_name:   'Stress',
      last_name:    `Test${Math.floor(Math.random() * 99999)}`,
      email:        `stress${Date.now()}@test.cookersdelight.com`,
      telephone:    '+233200000000',
      guest_num:    Math.floor(Math.random() * 8) + 1,
      reserve_date: futureDate,
      reserve_time: `${String(Math.floor(Math.random() * 6) + 12).padStart(2, '0')}:00`,
      location_id:  (Math.floor(Math.random() * 4) + 1),
    });

    const start = Date.now();
    const res   = http.post(`${BASE_URL}/reservations`, payload, {
      headers: HEADERS,
      timeout: '15s',
    });
    reserveLatency.add(Date.now() - start);

    if (res.status >= 500) serverErrors.add(1);
    if (res.status === 0)  timeoutErrors.add(1);

    check(res, {
      'reservation not 500': (r) => r.status < 500,
      'reservation not timeout': (r) => r.status !== 0,
    });
    errorRate.add(res.status >= 500 || res.status === 0);
  });
}

function stressWebhookEndpoint() {
  group('Stress: Paystack Webhook (authenticated write)', () => {
    const payload = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: `CD-${Math.floor(Math.random() * 10000)}-${Date.now()}`,
        amount:    Math.floor(Math.random() * 10000) + 1000,
        channel:   'card',
      },
    });

    // Deliberately send an invalid signature — we're stress-testing the HMAC
    // check path, not the payment processing path
    const start = Date.now();
    const res   = http.post(`${BASE_URL}/paystack-webhook`, payload, {
      headers: { ...HEADERS, 'X-Paystack-Signature': 'invalid_signature' },
      timeout: '10s',
    });
    webhookLatency.add(Date.now() - start);

    // Must return 401 quickly — not 500, not timeout
    const ok = check(res, {
      'webhook returns 401 for bad sig': (r) => r.status === 401,
      'webhook not 500': (r) => r.status < 500,
    });
    if (res.status >= 500) serverErrors.add(1);
    errorRate.add(res.status >= 500 || res.status === 0);
  });
}

function stressSessionEndpoints() {
  group('Stress: Table Sessions (mixed read/write)', () => {
    // Try to look up a non-existent session — should be fast 404
    const token = `stress-token-${Math.random().toString(36).substring(2)}`;
    const res = http.get(`${BASE_URL}/table-sessions/${token}`, {
      headers: HEADERS,
      timeout: '10s',
    });
    if (res.status >= 500) serverErrors.add(1);
    check(res, { 'session lookup not 500': (r) => r.status < 500 });
    errorRate.add(res.status >= 500 || res.status === 0);
  });
}

// ─── Recovery validation ──────────────────────────────────────────────────────

export function teardown() {
  // After ramp-down, verify the API has recovered — run a clean check
  const healthRes = http.get(`${BASE_URL}/locations?status=true`, {
    headers: HEADERS,
    timeout: '5s',
  });
  check(healthRes, {
    'API recovered after stress': (r) => r.status === 200,
    'API response time recovered': (r) => r.timings.duration < 1000,
  });
}

// ─── Main virtual user scenario ───────────────────────────────────────────────

export default function () {
  const scenario = Math.random();

  if (scenario < 0.40) {
    // 40 % read-only: menu browsing (most common)
    stressMenuEndpoints();
  } else if (scenario < 0.65) {
    // 25 % read-only: location browsing
    stressLocationEndpoint();
  } else if (scenario < 0.75) {
    // 10 % read-only: prep times
    stressPrepTimes();
  } else if (scenario < 0.85) {
    // 10 % write: reservations
    stressReservations();
  } else if (scenario < 0.93) {
    // 8 % auth-tested: webhook with bad signature
    stressWebhookEndpoint();
  } else {
    // 7 % session lookups
    stressSessionEndpoints();
  }

  // Minimal think time under stress to maximise concurrency
  sleep(Math.random() * 0.5);
}

// ─── Summary output ───────────────────────────────────────────────────────────

export function handleSummary(data) {
  return {
    'tests/k6/results/stress-test-summary.json': JSON.stringify(data, null, 2),
    stdout: formatStressSummary(data),
  };
}

function formatStressSummary(data) {
  const m = data.metrics || {};
  const lines = ['\n=== Stress Test Summary ==='];

  const trends = [
    ['http_req_duration (all)',   m.http_req_duration],
    ['stress_menu_latency',       m.stress_menu_latency],
    ['stress_reserve_latency',    m.stress_reserve_latency],
    ['stress_webhook_latency',    m.stress_webhook_latency],
  ];

  trends.forEach(([name, metric]) => {
    if (metric && metric.type === 'trend') {
      lines.push(`  ${name}:`);
      lines.push(`    avg=${metric.values.avg?.toFixed(0)}ms`);
      lines.push(`    p90=${metric.values['p(90)']?.toFixed(0)}ms`);
      lines.push(`    p95=${metric.values['p(95)']?.toFixed(0)}ms`);
      lines.push(`    p99=${metric.values['p(99)']?.toFixed(0)}ms`);
      lines.push(`    max=${metric.values.max?.toFixed(0)}ms`);
    }
  });

  lines.push('');
  lines.push(`  Total requests: ${m.http_reqs?.values.count || 'n/a'}`);
  lines.push(`  Failed requests: ${(m.http_req_failed?.values.rate * 100)?.toFixed(2) || 'n/a'}%`);
  lines.push(`  5xx errors: ${m.server_5xx_errors?.values.count || 0}`);
  lines.push(`  Timeouts: ${m.timeout_errors?.values.count || 0}`);
  lines.push(`  Custom error rate: ${(m.stress_errors?.values.rate * 100)?.toFixed(2) || 'n/a'}%`);
  lines.push('');

  const passed = data.root_group?.checks
    ? Object.values(data.root_group.checks).filter((c) => c.fails === 0).length
    : 'n/a';
  lines.push(`  Threshold results: see above`);

  return lines.join('\n') + '\n';
}
