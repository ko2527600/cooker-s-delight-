import React, { useEffect, useState } from 'react';
import {
  HiClipboardDocumentList,
  HiCurrencyDollar,
  HiQrCode,
  HiClock,
} from 'react-icons/hi2';
import { dashboardApi } from '../api';
import { Badge, Card, StatCard, Spinner } from '../components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  orders_today: number;
  revenue_today: number | string;
  tables_occupied: number;
  pending_orders: number;
}

interface OrderMenu {
  name: string;
  quantity: number;
  price: number | string;
}

interface Order {
  order_id: number;
  order_total: number | string;
  order_status?: string;
  status_name?: string;
  order_type?: string;
  created_at: string;
  status_id?: number;
  order_menus?: OrderMenu[];
  order_options?: string | Record<string, unknown>;
}

// ─── Status colors ────────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  Pending: '#eab308',
  New: '#eab308',
  Preparing: '#EC4824',
  Processing: '#EC4824',
  Ready: '#22c55e',
  Delivered: '#22c55e',
  Completed: '#22c55e',
  Served: '#6b7280',
  Cancelled: '#ef4444',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRevenue(value: number | string): string {
  if (typeof value === 'number') {
    return `GH₵${value.toFixed(2)}`;
  }
  return `GH₵${value}`;
}

function getStatusLabel(order: Order): string {
  return order.order_status ?? order.status_name ?? 'Unknown';
}

function getTableLabel(order: Order): string {
  try {
    const opts =
      typeof order.order_options === 'string'
        ? JSON.parse(order.order_options)
        : order.order_options;
    if (opts?.table_number) return `Table ${opts.table_number}`;
    if (opts?.location_name) return String(opts.location_name);
  } catch {
    // ignore parse errors
  }
  return order.order_type ?? '—';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  function fetchStats() {
    dashboardApi
      .stats()
      .then(res => {
        // TastyIgniter wraps payload in data.data
        const payload = res.data?.data ?? res.data;
        setStats(payload as DashboardStats);
        setStatsError(null);
      })
      .catch(() => setStatsError('Failed to load stats'))
      .finally(() => setStatsLoading(false));
  }

  function fetchOrders() {
    dashboardApi
      .recentOrders(10)
      .then(res => {
        const payload = res.data?.data ?? res.data;
        const list: Order[] = Array.isArray(payload)
          ? payload
          : payload?.data ?? [];
        setOrders(list);
        setOrdersError(null);
      })
      .catch(() => setOrdersError('Failed to load recent orders'))
      .finally(() => setOrdersLoading(false));
  }

  // Initial load — parallel
  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      fetchStats();
      fetchOrders();
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-white/40 text-sm mt-0.5">Live overview of today's activity</p>
      </div>

      {/* Stats row */}
      {statsError ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-red-400 text-sm">
          {statsError}
        </div>
      ) : statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 h-24 flex items-center justify-center">
              <Spinner size={24} />
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Orders Today"
            value={stats.orders_today ?? 0}
            icon={<HiClipboardDocumentList size={22} />}
            color="#EC4824"
          />
          <StatCard
            label="Revenue Today"
            value={formatRevenue(stats.revenue_today ?? 0)}
            icon={<HiCurrencyDollar size={22} />}
            color="#22c55e"
          />
          <StatCard
            label="Tables Occupied"
            value={stats.tables_occupied ?? 0}
            icon={<HiQrCode size={22} />}
            color="#a855f7"
          />
          <StatCard
            label="Pending Orders"
            value={stats.pending_orders ?? 0}
            icon={<HiClock size={22} />}
            color="#eab308"
          />
        </div>
      ) : null}

      {/* Recent orders */}
      <Card>
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="font-bold text-base">Recent Orders</h2>
          <span className="text-xs text-white/30">Last 10 orders</span>
        </div>

        {ordersError ? (
          <div className="px-6 py-5 text-red-400 text-sm">{ordersError}</div>
        ) : ordersLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">
            No orders yet today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-white/30 text-xs uppercase tracking-widest font-bold">
                  <th className="px-6 py-3 text-left">Order #</th>
                  <th className="px-6 py-3 text-left">Table / Type</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const statusLabel = getStatusLabel(order);
                  const statusColor = STATUS_COLORS[statusLabel] ?? '#6b7280';
                  return (
                    <tr
                      key={order.order_id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-3.5 font-mono text-white/80 font-bold">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-3.5 text-white/70">
                        {getTableLabel(order)}
                      </td>
                      <td className="px-6 py-3.5 text-white/60">
                        {order.order_menus?.length ?? 0}
                      </td>
                      <td className="px-6 py-3.5 text-white font-bold">
                        {formatRevenue(order.order_total ?? 0)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge color={statusColor}>{statusLabel}</Badge>
                      </td>
                      <td className="px-6 py-3.5 text-white/40 text-xs">
                        {timeAgo(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
