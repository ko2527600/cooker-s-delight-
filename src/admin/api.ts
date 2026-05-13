/**
 * Admin-authenticated TastyIgniter API client.
 * Token is read from localStorage on every request so it stays fresh
 * across tab reloads without needing a React provider.
 */
import axios, { type AxiosInstance } from 'axios';

const TOKEN_KEY = 'cd_admin_token';

function createAdminApi(): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_TI_API_URL ?? 'http://localhost:8000/api',
    headers: { Accept: 'application/json' },
    timeout: 15_000,
  });

  instance.interceptors.request.use(config => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return instance;
}

export const adminApi = createAdminApi();

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => adminApi.get('/dashboard/stats'),
  recentOrders: (limit = 10) => adminApi.get('/orders', { params: { pageLimit: limit, sort: 'created_at desc' } }),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  list:       (params?: object) => adminApi.get('/orders', { params }),
  get:        (id: number) => adminApi.get(`/orders/${id}`),
  updateStatus: (id: number, statusId: number) =>
    adminApi.put(`/orders/${id}`, { status_id: statusId }),
};

// ─── Menu items ───────────────────────────────────────────────────────────────
export const menuItemsApi = {
  list:   (params?: object) => adminApi.get('/menus', { params: { pageLimit: 200, ...params } }),
  get:    (id: number) => adminApi.get(`/menus/${id}`),
  create: (data: object) => adminApi.post('/menus', data),
  update: (id: number, data: object) => adminApi.put(`/menus/${id}`, data),
  delete: (id: number) => adminApi.delete(`/menus/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  list:   () => adminApi.get('/categories', { params: { pageLimit: 100 } }),
  create: (data: object) => adminApi.post('/categories', data),
  update: (id: number, data: object) => adminApi.put(`/categories/${id}`, data),
  delete: (id: number) => adminApi.delete(`/categories/${id}`),
};

// ─── Locations ────────────────────────────────────────────────────────────────
export const locationsApi = {
  list:   () => adminApi.get('/locations', { params: { pageLimit: 50 } }),
  get:    (id: number) => adminApi.get(`/locations/${id}`),
  update: (id: number, data: object) => adminApi.put(`/locations/${id}`, data),
};

// ─── Announcements ────────────────────────────────────────────────────────────
export const announcementsApi = {
  list:   () => adminApi.get('/announcements', { params: { pageLimit: 50 } }),
  create: (data: object) => adminApi.post('/announcements', data),
  update: (id: number, data: object) => adminApi.put(`/announcements/${id}`, data),
  delete: (id: number) => adminApi.delete(`/announcements/${id}`),
};

// ─── Reservations ─────────────────────────────────────────────────────────────
export const reservationsApi = {
  list: (params?: object) => adminApi.get('/reservations', { params: { pageLimit: 50, ...params } }),
  update: (id: number, data: object) => adminApi.put(`/reservations/${id}`, data),
};

// ─── Order statuses ───────────────────────────────────────────────────────────
export const statusesApi = {
  list:   () => adminApi.get('/statuses', { params: { status_for: 'order', pageLimit: 20 } }),
  update: (id: number, data: object) => adminApi.put(`/statuses/${id}`, data),
};

// ─── Prep times (CD extension) ────────────────────────────────────────────────
export const prepTimesApi = {
  list:   () => adminApi.get('/cd/prep-times'),
  update: (menuId: number, minutes: number) =>
    adminApi.put(`/cd/prep-times/${menuId}`, { prep_time_minutes: minutes }),
};

// ─── Custom CD settings (CD extension) ───────────────────────────────────────
export const cdSettingsApi = {
  list:   () => adminApi.get('/cd/settings'),
  set:    (key: string, value: unknown) => adminApi.put(`/cd/settings/${key}`, { value }),
  setMany: (pairs: Record<string, unknown>) => adminApi.put('/cd/settings', { settings: pairs }),
};
