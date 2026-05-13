/**
 * UI Tests — validate that React components correctly interact with the API
 * layer: loading states, successful renders, error states, and user interactions
 * that trigger API calls.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import {
  fixtureMenuItem,
  fixtureCategory,
  fixtureLocation,
  fixtureAnnouncement,
} from './mocks/handlers';

const BASE = 'http://localhost:8000/api';

// ─── Minimal stub components ─────────────────────────────────────────────────
// These directly exercise the api module in a realistic React lifecycle.

/** Renders a list of locations fetched from the API. */
const LocationList: React.FC = () => {
  const [locations, setLocations] = React.useState<{ location_id: number; location_name: string }[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    import('../../src/lib/api').then(({ locationApi }) =>
      locationApi
        .list()
        .then((r) => setLocations(r.data.data))
        .catch(() => setError('Failed to load locations'))
        .finally(() => setLoading(false))
    );
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  return (
    <ul>
      {locations.map((l) => (
        <li key={l.location_id}>{l.location_name}</li>
      ))}
    </ul>
  );
};

/** Renders a list of menu items fetched from the API. */
const MenuList: React.FC<{ locationId?: number }> = ({ locationId }) => {
  const [items, setItems] = React.useState<{ menu_id: number; menu_name: string; menu_price: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    import('../../src/lib/api').then(({ menuApi }) =>
      menuApi
        .getItems(locationId)
        .then((r) => setItems(r.data.data))
        .catch(() => setError('Failed to load menu'))
        .finally(() => setLoading(false))
    );
  }, [locationId]);

  if (loading) return <p>Loading menu…</p>;
  if (error) return <p role="alert">{error}</p>;
  return (
    <ul>
      {items.map((i) => (
        <li key={i.menu_id} data-testid="menu-item">
          <span data-testid="item-name">{i.menu_name}</span>
          <span data-testid="item-price">GH₵ {i.menu_price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
};

/** Simple reservation form. */
const ReservationForm: React.FC = () => {
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const { reservationApi } = await import('../../src/lib/api');
    try {
      await reservationApi.create({
        first_name: 'Ama',
        last_name: 'Owusu',
        email: 'ama@example.com',
        telephone: '+233200000000',
        guest_num: 2,
        reserve_date: '2026-06-01',
        reserve_time: '13:00',
        location_id: 1,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Booking…' : 'Book Table'}
      </button>
      {status === 'success' && <p role="status">Reservation confirmed!</p>}
      {status === 'error' && <p role="alert">Booking failed. Please try again.</p>}
    </form>
  );
};

/** Announcement banner */
const AnnouncementBanner: React.FC = () => {
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    import('../../src/lib/api').then(({ announcementApi }) =>
      announcementApi.getActive().then((r) => {
        if (r.data.data.length > 0) setMsg(r.data.data[0].message);
      })
    );
  }, []);

  if (!msg) return null;
  return <div role="banner">{msg}</div>;
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('UI Tests — LocationList component', () => {
  it('shows loading state initially', () => {
    render(<LocationList />);
    expect(screen.getByText('Loading…')).toBeTruthy();
  });

  it('renders location names after API response', async () => {
    render(<LocationList />);
    await waitFor(() => expect(screen.queryByText('Loading…')).toBeNull());
    expect(screen.getByText(fixtureLocation.location_name)).toBeTruthy();
  });

  it('shows error message when API fails', async () => {
    server.use(
      http.get(`${BASE}/locations`, () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      )
    );
    render(<LocationList />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('Failed to load locations');
  });
});

describe('UI Tests — MenuList component', () => {
  it('shows loading state initially', () => {
    render(<MenuList />);
    expect(screen.getByText('Loading menu…')).toBeTruthy();
  });

  it('renders menu items with name and price', async () => {
    render(<MenuList />);
    await waitFor(() => expect(screen.queryByText('Loading menu…')).toBeNull());
    expect(screen.getByTestId('item-name').textContent).toBe(fixtureMenuItem.menu_name);
    expect(screen.getByTestId('item-price').textContent).toContain(fixtureMenuItem.menu_price.toFixed(2));
  });

  it('renders empty list when server returns no items', async () => {
    server.use(http.get(`${BASE}/menus`, () => HttpResponse.json({ data: [] })));
    render(<MenuList />);
    await waitFor(() => expect(screen.queryByText('Loading menu…')).toBeNull());
    expect(screen.queryAllByTestId('menu-item')).toHaveLength(0);
  });

  it('shows error message when menu API fails', async () => {
    server.use(
      http.get(`${BASE}/menus`, () => HttpResponse.json({ message: 'Error' }, { status: 503 }))
    );
    render(<MenuList />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('Failed to load menu');
  });
});

describe('UI Tests — ReservationForm component', () => {
  it('renders submit button in idle state', () => {
    render(<ReservationForm />);
    expect(screen.getByRole('button').textContent).toBe('Book Table');
  });

  it('shows success message after successful booking', async () => {
    const user = userEvent.setup();
    render(<ReservationForm />);
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(screen.getByRole('status').textContent).toContain('Reservation confirmed');
  });

  it('shows error message when booking API fails', async () => {
    server.use(
      http.post(`${BASE}/reservations`, () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 })
      )
    );
    const user = userEvent.setup();
    render(<ReservationForm />);
    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toContain('Booking failed');
  });

  it('disables submit button while submitting to prevent double-submit', async () => {
    server.use(
      http.post(`${BASE}/reservations`, async () => {
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json({ data: { reservation_id: 1 } }, { status: 201 });
      })
    );
    const user = userEvent.setup();
    render(<ReservationForm />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    await waitFor(() => expect(btn).toBeDisabled());
  });
});

describe('UI Tests — AnnouncementBanner component', () => {
  it('renders announcement message from API', async () => {
    render(<AnnouncementBanner />);
    await waitFor(() => expect(screen.getByRole('banner')).toBeTruthy());
    expect(screen.getByRole('banner').textContent).toBe(fixtureAnnouncement.message);
  });

  it('renders nothing when there are no active announcements', async () => {
    server.use(http.get(`${BASE}/announcements`, () => HttpResponse.json({ data: [] })));
    render(<AnnouncementBanner />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('banner')).toBeNull();
  });
});
