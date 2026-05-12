import axios from 'axios';
import type {
  ApiResponse,
  TIMenuItem,
  TICategory,
  TILocation,
  TIReservation,
  TIAnnouncement,
  ReservationInput,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_TI_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TI_API_TOKEN ?? ''}`,
    Accept: 'application/json',
  },
  timeout: 10_000,
});

// ─── Menu ────────────────────────────────────────────────────────────────────

export const menuApi = {
  getItems: (locationId?: number) =>
    api.get<ApiResponse<TIMenuItem[]>>('/menus', {
      params: { location: locationId, enabled: true, pageLimit: 100 },
    }),

  getCategories: (locationId?: number) =>
    api.get<ApiResponse<TICategory[]>>('/categories', {
      params: { location: locationId, status: true },
    }),
};

// ─── Locations ───────────────────────────────────────────────────────────────

export const locationApi = {
  list: () => api.get<ApiResponse<TILocation[]>>('/locations', { params: { status: true } }),
  get:  (id: number) => api.get<ApiResponse<TILocation>>(`/locations/${id}`),
};

// ─── Reservations ─────────────────────────────────────────────────────────────

export const reservationApi = {
  create: (data: ReservationInput) =>
    api.post<ApiResponse<TIReservation>>('/reservations', data),

  getSlots: (params: { date: string; guests: number; location_id: number }) =>
    api.get<ApiResponse<string[]>>('/reservations/timeslots', { params }),
};

// ─── Announcements ────────────────────────────────────────────────────────────

export const announcementApi = {
  getActive: () =>
    api.get<ApiResponse<TIAnnouncement[]>>('/announcements', { params: { active: true } }),
};

export default api;
