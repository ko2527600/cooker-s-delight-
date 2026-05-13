/**
 * Security Tests — verify that the API client enforces security controls and
 * that responses do not introduce XSS or information-disclosure vulnerabilities.
 */
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { menuApi, reservationApi, announcementApi, locationApi } from '../../src/lib/api';
import type { ReservationInput } from '../../src/types';

const BASE = 'http://localhost:8000/api';

describe('Security — Transport and authentication', () => {
  it('every request carries an Authorization header', async () => {
    const captured: string[] = [];
    server.use(
      http.get(`${BASE}/menus`, ({ request }) => {
        captured.push(request.headers.get('Authorization') ?? '');
        return HttpResponse.json({ data: [] });
      }),
      http.get(`${BASE}/categories`, ({ request }) => {
        captured.push(request.headers.get('Authorization') ?? '');
        return HttpResponse.json({ data: [] });
      }),
      http.get(`${BASE}/locations`, ({ request }) => {
        captured.push(request.headers.get('Authorization') ?? '');
        return HttpResponse.json({ data: [] });
      })
    );
    await Promise.all([menuApi.getItems(), menuApi.getCategories(), locationApi.list()]);
    captured.forEach((h) => expect(h).toBeTruthy());
  });

  it('reservation payload is sent via POST body, not query string', async () => {
    let capturedUrl = '';
    let capturedBody: unknown = null;
    server.use(
      http.post(`${BASE}/reservations`, async ({ request }) => {
        capturedUrl = request.url;
        capturedBody = await request.json();
        return HttpResponse.json({ data: { reservation_id: 1 } }, { status: 201 });
      })
    );
    const input: ReservationInput = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      telephone: '+233201234567',
      guest_num: 2,
      reserve_date: '2026-06-01',
      reserve_time: '12:00',
      location_id: 1,
    };
    await reservationApi.create(input);
    expect(capturedUrl).not.toContain('email=');
    expect(capturedBody).toMatchObject({ email: 'test@example.com' });
  });
});

describe('Security — XSS in API responses', () => {
  it('announcement message containing script tag is returned as raw string (no eval)', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    server.use(
      http.get(`${BASE}/announcements`, () =>
        HttpResponse.json({ data: [{ id: 1, message: xssPayload, background_color: '#fff', text_color: '#000', is_active: true }] })
      )
    );
    const res = await announcementApi.getActive();
    // The client returns it as a plain string — rendering is the consumer's responsibility
    expect(res.data.data[0].message).toBe(xssPayload);
    // Confirm no automatic execution — it's just data
    expect(typeof res.data.data[0].message).toBe('string');
  });

  it('menu item name with HTML entities comes through as a string', async () => {
    server.use(
      http.get(`${BASE}/menus`, () =>
        HttpResponse.json({
          data: [{ menu_id: 1, menu_name: '<b>Rice & Stew</b>', menu_price: 30, menu_status: true }],
        })
      )
    );
    const res = await menuApi.getItems();
    expect(typeof res.data.data[0].menu_name).toBe('string');
  });
});

describe('Security — Input boundary enforcement', () => {
  it('locationApi.get with a non-numeric path segment hits a 404', async () => {
    server.use(
      http.get(`${BASE}/locations/:id`, ({ params }) => {
        if (!/^\d+$/.test(String(params.id))) {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        }
        return HttpResponse.json({ data: {} });
      })
    );
    // TypeScript prevents passing a string, but test the numeric coercion boundary
    await expect(locationApi.get(NaN)).rejects.toMatchObject({ response: { status: 404 } });
  });

  it('reservationApi rejects a server-side validation error (no silent swallow)', async () => {
    server.use(
      http.post(`${BASE}/reservations`, () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: { email: ['The email field is required.'] } },
          { status: 422 }
        )
      )
    );
    await expect(
      reservationApi.create({
        first_name: '',
        last_name: '',
        email: '',
        telephone: '',
        guest_num: 0,
        reserve_date: '',
        reserve_time: '',
        location_id: 0,
      })
    ).rejects.toMatchObject({ response: { status: 422 } });
  });
});

describe('Security — Information disclosure', () => {
  it('401 Unauthorized from server propagates as a rejected promise with status 401', async () => {
    server.use(
      http.get(`${BASE}/menus`, () =>
        HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
      )
    );
    await expect(menuApi.getItems()).rejects.toMatchObject({ response: { status: 401 } });
  });

  it('403 Forbidden from server propagates correctly', async () => {
    server.use(
      http.get(`${BASE}/locations`, () =>
        HttpResponse.json({ message: 'Forbidden.' }, { status: 403 })
      )
    );
    await expect(locationApi.list()).rejects.toMatchObject({ response: { status: 403 } });
  });
});
