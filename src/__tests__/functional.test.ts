/**
 * Functional Tests — verify that each API method returns correctly shaped data
 * and passes the expected query parameters / request body to the server.
 */
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import {
  menuApi,
  locationApi,
  reservationApi,
  prepTimeApi,
  announcementApi,
} from '../../src/lib/api';
import {
  fixtureMenuItem,
  fixtureCategory,
  fixtureLocation,
  fixtureReservation,
  fixtureAnnouncement,
} from './mocks/handlers';
import type { ReservationInput } from '../../src/types';

const BASE = 'http://localhost:8000/api';

describe('Functional Tests — menuApi', () => {
  it('getItems returns array of menu items with correct shape', async () => {
    const res = await menuApi.getItems();
    expect(Array.isArray(res.data.data)).toBe(true);
    const item = res.data.data[0];
    expect(item).toHaveProperty('menu_id');
    expect(item).toHaveProperty('menu_name');
    expect(item).toHaveProperty('menu_price');
    expect(item).toHaveProperty('menu_status');
  });

  it('getItems sends enabled=true query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/menus`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [fixtureMenuItem] });
      })
    );
    await menuApi.getItems();
    expect(capturedUrl).toContain('enabled=true');
  });

  it('getItems sends location param when locationId is provided', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/menus`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [fixtureMenuItem] });
      })
    );
    await menuApi.getItems(5);
    expect(capturedUrl).toContain('location=5');
  });

  it('getCategories returns array of categories with correct shape', async () => {
    const res = await menuApi.getCategories();
    expect(Array.isArray(res.data.data)).toBe(true);
    const cat = res.data.data[0];
    expect(cat).toHaveProperty('category_id');
    expect(cat).toHaveProperty('name');
    expect(cat).toHaveProperty('status');
  });

  it('getCategories sends status=true query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/categories`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [fixtureCategory] });
      })
    );
    await menuApi.getCategories();
    expect(capturedUrl).toContain('status=true');
  });

  it('menu item price is a number', async () => {
    const res = await menuApi.getItems();
    expect(typeof res.data.data[0].menu_price).toBe('number');
  });
});

describe('Functional Tests — locationApi', () => {
  it('list returns array of locations', async () => {
    const res = await locationApi.list();
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it('list sends status=true query param', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/locations`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [fixtureLocation] });
      })
    );
    await locationApi.list();
    expect(capturedUrl).toContain('status=true');
  });

  it('get(1) returns a single location object', async () => {
    const res = await locationApi.get(1);
    expect(res.data.data).toHaveProperty('location_id', 1);
    expect(res.data.data).toHaveProperty('location_name');
    expect(res.data.data).toHaveProperty('location_city');
  });

  it('get returns 404 for an unknown location id', async () => {
    await expect(locationApi.get(9999)).rejects.toMatchObject({ response: { status: 404 } });
  });
});

describe('Functional Tests — reservationApi', () => {
  const validInput: ReservationInput = {
    first_name: 'Ama',
    last_name: 'Owusu',
    email: 'ama@example.com',
    telephone: '+233200000000',
    guest_num: 2,
    reserve_date: '2026-06-01',
    reserve_time: '13:00',
    location_id: 1,
    comment: 'Window seat please',
  };

  it('create sends a POST request and returns the created reservation', async () => {
    const res = await reservationApi.create(validInput);
    expect(res.status).toBe(201);
    expect(res.data.data).toHaveProperty('reservation_id');
    expect(res.data.data.email).toBe(fixtureReservation.email);
  });

  it('create sends the full reservation payload in the request body', async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post(`${BASE}/reservations`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ data: fixtureReservation }, { status: 201 });
      })
    );
    await reservationApi.create(validInput);
    expect(capturedBody).toMatchObject({
      first_name: 'Ama',
      last_name: 'Owusu',
      email: 'ama@example.com',
      guest_num: 2,
    });
  });

  it('getSlots returns an array of time strings', async () => {
    const res = await reservationApi.getSlots({ date: '2026-06-01', guests: 2, location_id: 1 });
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data[0]).toMatch(/^\d{2}:\d{2}$/);
  });

  it('getSlots sends date, guests, and location_id params', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/reservations/timeslots`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: ['13:00'] });
      })
    );
    await reservationApi.getSlots({ date: '2026-06-15', guests: 4, location_id: 2 });
    expect(capturedUrl).toContain('date=2026-06-15');
    expect(capturedUrl).toContain('guests=4');
    expect(capturedUrl).toContain('location_id=2');
  });
});

describe('Functional Tests — prepTimeApi', () => {
  it('getAll returns a record keyed by menu_id strings', async () => {
    const res = await prepTimeApi.getAll();
    expect(typeof res.data.data).toBe('object');
    const firstKey = Object.keys(res.data.data)[0];
    expect(typeof firstKey).toBe('string');
    expect(typeof res.data.data[firstKey]).toBe('number');
  });
});

describe('Functional Tests — announcementApi', () => {
  it('getActive returns array of announcements', async () => {
    const res = await announcementApi.getActive();
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it('announcement has required fields', async () => {
    const res = await announcementApi.getActive();
    const ann = res.data.data[0];
    expect(ann).toHaveProperty('id');
    expect(ann).toHaveProperty('message');
    expect(ann).toHaveProperty('is_active');
    expect(ann).toHaveProperty('background_color');
    expect(ann).toHaveProperty('text_color');
  });

  it('getActive sends active=true param', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/announcements`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [fixtureAnnouncement] });
      })
    );
    await announcementApi.getActive();
    expect(capturedUrl).toContain('active=true');
  });
});
