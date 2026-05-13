/**
 * Smoke Tests — quick sanity checks that the API modules are wired up and
 * each endpoint responds with a non-error HTTP status.
 */
import { describe, it, expect } from 'vitest';
import { menuApi, locationApi, reservationApi, prepTimeApi, announcementApi } from '../../src/lib/api';

describe('Smoke Tests — API modules are importable and callable', () => {
  it('menuApi module exports are defined', () => {
    expect(menuApi).toBeDefined();
    expect(typeof menuApi.getItems).toBe('function');
    expect(typeof menuApi.getCategories).toBe('function');
  });

  it('locationApi module exports are defined', () => {
    expect(locationApi).toBeDefined();
    expect(typeof locationApi.list).toBe('function');
    expect(typeof locationApi.get).toBe('function');
  });

  it('reservationApi module exports are defined', () => {
    expect(reservationApi).toBeDefined();
    expect(typeof reservationApi.create).toBe('function');
    expect(typeof reservationApi.getSlots).toBe('function');
  });

  it('prepTimeApi module exports are defined', () => {
    expect(prepTimeApi).toBeDefined();
    expect(typeof prepTimeApi.getAll).toBe('function');
  });

  it('announcementApi module exports are defined', () => {
    expect(announcementApi).toBeDefined();
    expect(typeof announcementApi.getActive).toBe('function');
  });

  it('menuApi.getItems() responds with HTTP 200', async () => {
    const res = await menuApi.getItems();
    expect(res.status).toBe(200);
  });

  it('menuApi.getCategories() responds with HTTP 200', async () => {
    const res = await menuApi.getCategories();
    expect(res.status).toBe(200);
  });

  it('locationApi.list() responds with HTTP 200', async () => {
    const res = await locationApi.list();
    expect(res.status).toBe(200);
  });

  it('locationApi.get(id) responds with HTTP 200 for a known location', async () => {
    const res = await locationApi.get(1);
    expect(res.status).toBe(200);
  });

  it('reservationApi.getSlots() responds with HTTP 200', async () => {
    const res = await reservationApi.getSlots({ date: '2026-06-01', guests: 2, location_id: 1 });
    expect(res.status).toBe(200);
  });

  it('prepTimeApi.getAll() responds with HTTP 200', async () => {
    const res = await prepTimeApi.getAll();
    expect(res.status).toBe(200);
  });

  it('announcementApi.getActive() responds with HTTP 200', async () => {
    const res = await announcementApi.getActive();
    expect(res.status).toBe(200);
  });
});
