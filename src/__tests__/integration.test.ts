/**
 * Integration Tests — test coordinated flows involving multiple API calls
 * in sequence, ensuring data flows correctly from one call to the next.
 */
import { describe, it, expect } from 'vitest';
import { menuApi, locationApi, reservationApi, announcementApi, prepTimeApi } from '../../src/lib/api';
import type { ReservationInput } from '../../src/types';

describe('Integration Tests — Browse menu flow', () => {
  it('fetches locations then menu items filtered by first location', async () => {
    const locRes = await locationApi.list();
    const locations = locRes.data.data;
    expect(locations.length).toBeGreaterThan(0);

    const locationId = locations[0].location_id;
    const menuRes = await menuApi.getItems(locationId);
    expect(menuRes.data.data).toBeDefined();
    expect(Array.isArray(menuRes.data.data)).toBe(true);
  });

  it('fetches categories then enriches menu items with category names', async () => {
    const [catRes, menuRes] = await Promise.all([
      menuApi.getCategories(),
      menuApi.getItems(),
    ]);

    const categories = catRes.data.data;
    const items = menuRes.data.data;

    const categoryMap = new Map(categories.map((c) => [c.category_id, c.name]));
    const enriched = items.map((item) => ({
      ...item,
      categoryNames: (item.categories ?? []).map((c) => categoryMap.get(c.category_id) ?? c.name),
    }));

    expect(enriched[0]).toHaveProperty('categoryNames');
    expect(Array.isArray(enriched[0].categoryNames)).toBe(true);
  });

  it('fetches prep times and attaches them to menu items', async () => {
    const [menuRes, prepRes] = await Promise.all([
      menuApi.getItems(),
      prepTimeApi.getAll(),
    ]);

    const items = menuRes.data.data;
    const prepTimes = prepRes.data.data;

    const enriched = items.map((item) => ({
      ...item,
      resolvedPrepTime: prepTimes[String(item.menu_id)] ?? item.prep_time_minutes ?? null,
    }));

    expect(enriched[0]).toHaveProperty('resolvedPrepTime');
  });
});

describe('Integration Tests — Reservation booking flow', () => {
  it('fetches available slots then creates a reservation in that slot', async () => {
    const slotsRes = await reservationApi.getSlots({
      date: '2026-06-01',
      guests: 2,
      location_id: 1,
    });

    const slots = slotsRes.data.data;
    expect(slots.length).toBeGreaterThan(0);

    const chosenSlot = slots[0];

    const reservationInput: ReservationInput = {
      first_name: 'Kofi',
      last_name: 'Mensah',
      email: 'kofi@example.com',
      telephone: '+233200000099',
      guest_num: 2,
      reserve_date: '2026-06-01',
      reserve_time: chosenSlot,
      location_id: 1,
    };

    const createRes = await reservationApi.create(reservationInput);
    expect(createRes.status).toBe(201);
    expect(createRes.data.data).toHaveProperty('reservation_id');
  });
});

describe('Integration Tests — Restaurant overview dashboard', () => {
  it('loads locations, announcements, and prep times in parallel', async () => {
    const [locRes, annRes, prepRes] = await Promise.all([
      locationApi.list(),
      announcementApi.getActive(),
      prepTimeApi.getAll(),
    ]);

    expect(locRes.status).toBe(200);
    expect(annRes.status).toBe(200);
    expect(prepRes.status).toBe(200);

    expect(Array.isArray(locRes.data.data)).toBe(true);
    expect(Array.isArray(annRes.data.data)).toBe(true);
    expect(typeof prepRes.data.data).toBe('object');
  });

  it('location detail enriches the location list entry', async () => {
    const listRes = await locationApi.list();
    const firstId = listRes.data.data[0].location_id;

    const detailRes = await locationApi.get(firstId);
    expect(detailRes.data.data.location_id).toBe(firstId);
    expect(detailRes.data.data.location_name).toBe(listRes.data.data[0].location_name);
  });
});

describe('Integration Tests — Full page load sequence', () => {
  it('menu page: parallel fetch of items and categories completes without error', async () => {
    await expect(
      Promise.all([menuApi.getItems(), menuApi.getCategories()])
    ).resolves.toHaveLength(2);
  });

  it('home page: parallel fetch of announcements and locations completes', async () => {
    await expect(
      Promise.all([announcementApi.getActive(), locationApi.list()])
    ).resolves.toHaveLength(2);
  });
});
