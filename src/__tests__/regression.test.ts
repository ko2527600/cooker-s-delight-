/**
 * Regression Tests — guard against previously fixed bugs and ensure core
 * behaviours remain stable across code changes.
 */
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import {
  menuApi,
  locationApi,
  reservationApi,
  prepTimeApi,
  announcementApi,
} from '../../src/lib/api';

const BASE = 'http://localhost:8000/api';

describe('Regression — API client defaults', () => {
  it('axios instance has a 10 s timeout', async () => {
    // Import the raw axios instance to inspect config
    const { default: api } = await import('../../src/lib/api');
    expect((api as any).defaults?.timeout).toBe(10_000);
  });

  it('Authorization header uses Bearer prefix', async () => {
    let capturedAuth = '';
    server.use(
      http.get(`${BASE}/menus`, ({ request }) => {
        capturedAuth = request.headers.get('Authorization') ?? '';
        return HttpResponse.json({ data: [] });
      })
    );
    await menuApi.getItems();
    expect(capturedAuth.startsWith('Bearer ')).toBe(true);
  });

  it('Accept: application/json header is sent', async () => {
    let capturedAccept = '';
    server.use(
      http.get(`${BASE}/menus`, ({ request }) => {
        capturedAccept = request.headers.get('Accept') ?? '';
        return HttpResponse.json({ data: [] });
      })
    );
    await menuApi.getItems();
    expect(capturedAccept).toBe('application/json');
  });
});

describe('Regression — Response shape stability', () => {
  it('menuApi.getItems() response always wraps items in data.data array', async () => {
    const res = await menuApi.getItems();
    expect(res.data).toHaveProperty('data');
    expect(Array.isArray(res.data.data)).toBe(true);
  });

  it('pagination meta is preserved when returned by server', async () => {
    server.use(
      http.get(`${BASE}/menus`, () =>
        HttpResponse.json({
          data: [],
          meta: {
            pagination: { total: 50, count: 10, per_page: 10, current_page: 1, total_pages: 5 },
          },
        })
      )
    );
    const res = await menuApi.getItems();
    expect(res.data.meta?.pagination?.total).toBe(50);
    expect(res.data.meta?.pagination?.total_pages).toBe(5);
  });

  it('prepTimeApi returns data keyed by string menu_id', async () => {
    const res = await prepTimeApi.getAll();
    const keys = Object.keys(res.data.data);
    keys.forEach((k) => expect(typeof k).toBe('string'));
  });

  it('locationApi.list returns location_status as boolean', async () => {
    const res = await locationApi.list();
    expect(typeof res.data.data[0].location_status).toBe('boolean');
  });
});

describe('Regression — Error handling does not mask HTTP errors', () => {
  it('locationApi.get rejects with axios error on 404', async () => {
    await expect(locationApi.get(9999)).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('reservationApi.create rejects on validation error (422)', async () => {
    server.use(
      http.post(`${BASE}/reservations`, () =>
        HttpResponse.json({ message: 'Unprocessable', errors: { email: ['required'] } }, { status: 422 })
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

  it('menuApi.getItems rejects on server error (500)', async () => {
    server.use(
      http.get(`${BASE}/menus`, () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      )
    );
    await expect(menuApi.getItems()).rejects.toMatchObject({ response: { status: 500 } });
  });
});

describe('Regression — Query param correctness', () => {
  it('menuApi.getItems sends pageLimit=100 to avoid truncated menus', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/menus`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await menuApi.getItems();
    expect(capturedUrl).toContain('pageLimit=100');
  });

  it('announcementApi.getActive always sends active=true', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE}/announcements`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );
    await announcementApi.getActive();
    expect(capturedUrl).toContain('active=true');
  });
});
