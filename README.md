# Cookers Delight

[![TastyIgniter](https://img.shields.io/badge/TastyIgniter-v4-EC4824?style=for-the-badge)](https://tastyigniter.com/)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Livewire](https://img.shields.io/badge/Livewire-3-FB70A9?style=for-the-badge&logo=livewire&logoColor=white)](https://livewire.laravel.com/)

A three-tier restaurant platform powering Cookers Delight — Ghanaian, Nigerian, and West African cuisine across four Accra branches.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              Public Marketing Site (React/Vite)              │
│   Home | Menu | Gallery | Branches | Reviews | Bookings      │
└────────────────────────┬─────────────────────────────────────┘
                         │ REST API (ti-ext-api)
┌────────────────────────▼─────────────────────────────────────┐
│            TastyIgniter v4 (PHP 8.3 / Laravel 11)            │
│   Admin | Menu | Orders | Reservations | Locations | API     │
│   Custom: CookersDelight.TableSession (QR + SSE + Paystack)  │
└───────┬───────────────────────────────────┬──────────────────┘
        │ Thin API bridge                   │
┌───────▼──────────────────┐     ┌──────────▼──────────────────┐
│  kawax/self-ordering     │     │  MySQL 8 + DO Spaces + SMTP │
│  (Laravel 13 + Livewire) │     └─────────────────────────────┘
│  QR scan → cart → pay    │
└──────────────────────────┘
```

### How the pieces talk

- **TastyIgniter is the source of truth** — menu, prices, orders, inventory, reservations all live here.
- **React site** is read-mostly: pulls menu/locations/announcements from TI's REST API and posts reservations.
- **kawax/self-ordering** is the QR ordering layer. It uses a thin `TastyIgniterOrderService` bridge to fetch menu and submit dine-in orders to TI. It never duplicates business state.
- **Paystack webhook** is the only path that marks an order paid — the frontend callback only redirects the customer.
- **SSE** (Server-Sent Events) drives the live "Pending → Received → Preparing → Ready → Served" tracker — no polling.

---

## Repository structure

```
cookers-delight/
├── backend/                       # TastyIgniter installation
│   ├── extensions/
│   │   └── CookersDelight/
│   │       └── TableSession/      # Custom: QR tokens, SSE stream, Paystack webhook
│   └── database/seeders/
│       └── CookersDelightSeeder.php
│
├── qr-ordering/                   # kawax/self-ordering (QR table ordering)
│   └── app/
│       ├── Services/TastyIgniterOrderService.php   # Thin TI bridge
│       ├── Menu/TastyIgniterMenuDriver.php          # Menu cache (5 min)
│       └── Payment/PaystackDriver.php               # Payment-first flow
│
├── src/                           # React public marketing site
│   ├── App.tsx                    # Routing only (<30 lines)
│   ├── pages/                     # HomePage, MenuPage, GalleryPage, BranchesPage,
│   │                              #   ReviewsPage, BookingsPage, ContactPage, PublicLayout
│   ├── components/                # Navbar, Footer, AnnouncementBar, Toast, PageWrapper, ...
│   ├── lib/api.ts                 # Type-safe TastyIgniter REST client
│   ├── types/index.ts             # Full TS types for TI API responses
│   ├── hooks/useApi.ts            # Typed fetch hook with AbortController
│   └── utils/image.ts             # Image URL helper
│
└── package.json                   # React/Vite frontend
```

---

## Tech stack

| Layer | Stack |
|---|---|
| Backend | TastyIgniter v4, PHP 8.3, Laravel 11, MySQL 8, `ti-ext-api`, `ti-ext-reservation` |
| QR ordering | revolution/self-ordering v6, Laravel 13, Livewire 3, Tailwind |
| Public site | React 19, TypeScript, Vite 7, Tailwind, React Router v7, Motion (Framer) |
| Payments | Paystack (HMAC-verified webhook) |
| Real-time | Server-Sent Events (no WebSocket server needed) |
| Storage | DigitalOcean Spaces (images), local SMTP/Mailgun (email) |
| Deployment | DO Droplet (Nginx + PHP-FPM) for backend + QR, Vercel for React site |

---

## Getting started

### Prerequisites

- **PHP 8.3+** and **Composer 2+** (for `backend/` and `qr-ordering/`)
- **MySQL 8+**
- **Node 20+** (for `src/` React site)

### 1. Backend (TastyIgniter)

```bash
cd backend
cp .env.example .env
# Configure DB_*, MAIL_*, APP_URL, plus PAYSTACK_* in services config

composer install
php artisan key:generate
php artisan migrate
php artisan db:seed --class=CookersDelightSeeder
php artisan serve              # http://localhost:8000
```

Admin panel: `http://localhost:8000/admin`. Generate an API token under **Admin → Tools → APIs**.

### 2. QR ordering layer (kawax)

```bash
cd qr-ordering
cp .env.example .env
# Set TI_API_URL=http://localhost:8000/api and paste the TI API token

composer install
npm install && npm run build
php artisan serve --port=8001  # http://localhost:8001
```

### 3. React public site

```bash
cp .env.example .env.local
# VITE_TI_API_URL=http://localhost:8000/api
# VITE_TI_API_TOKEN=<paste TI token>
# VITE_QR_ORDER_URL=http://localhost:8001

npm install
npm run dev                    # http://localhost:5173
```

---

## Environment variables

### React site (`.env.local`)
```env
VITE_TI_API_URL=http://localhost:8000/api
VITE_TI_API_TOKEN=your_tastyigniter_api_token
VITE_QR_ORDER_URL=http://localhost:8001
```

### TastyIgniter backend (`backend/.env`)
- `DB_*` — MySQL connection
- `MAIL_*` — SMTP for order confirmations
- `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`

### QR ordering (`qr-ordering/.env`)
- `TI_API_URL`, `TI_API_TOKEN` — bridge to TastyIgniter
- `ORDERING_MENU_DRIVER=tastyigniter`
- `PAYSTACK_*` — same keys as backend

---

## Order flow

1. Customer scans a QR code at their table → opens `qr-ordering/qr/{token}`
2. `TableSession` (4-hour UUID, TI extension) resolves the table + location
3. Customer selects items from menu (fetched from TI, cached 5 min)
4. Order submitted to TI via `TastyIgniterOrderService` → returns `order_id`
5. Paystack initialized with reference `CD-{order_id}-{timestamp}`
6. Customer pays → Paystack webhook (HMAC-verified) marks order **Received** in TI
7. Order status page subscribes to SSE stream → live status updates as kitchen advances
8. Waiter updates status in TI admin → SSE pushes to customer instantly

---

## Locations

Four branches in Accra: **Kaneshie · Circle · East Legon · Swan Lake**

- **WhatsApp / Phone**: [+233 24 337 9412](https://wa.me/233243379412)
- **Instagram**: [@cookersdelightgh](https://instagram.com/cookersdelightgh)

---

<div align="center">
  <p>Great Foods. Great People.</p>
  <p>© 2026 Cookers Delight · Accra, Ghana</p>
</div>
