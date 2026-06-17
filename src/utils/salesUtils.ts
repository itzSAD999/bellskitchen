// utils/salesUtils.ts

import { Order } from '../types';

export interface SalesMetrics {
  totalRevenue:  number;
  orderCount:    number;
  cashRevenue:   number;
  momoRevenue:   number;
  cashCount:     number;
  momoCount:     number;
  topItems:      { name: string; count: number; revenue: number }[];
}

/**
 * Compute dashboard metrics from a list of completed orders.
 */
export function calcSalesMetrics(orders: Order[]): SalesMetrics {
  const completed = orders.filter(o => o.status === 'completed');

  const totalRevenue = parseFloat(completed.reduce((s, o) => s + o.total, 0).toFixed(2));
  const orderCount   = completed.length;

  const cashOrders = completed.filter(o => o.paymentMethod === 'cash');
  const momoOrders = completed.filter(o => o.paymentMethod === 'momo');

  const cashRevenue = parseFloat(cashOrders.reduce((s, o) => s + o.total, 0).toFixed(2));
  const momoRevenue = parseFloat(momoOrders.reduce((s, o) => s + o.total, 0).toFixed(2));

  // Aggregate item counts from all bundles (accounting for quantity)
  const itemMap = new Map<string, { count: number; revenue: number }>();
  for (const order of completed) {
    for (const bundle of order.items) {
      const qty = bundle.quantity ?? 1;
      const existing = itemMap.get(bundle.name) ?? { count: 0, revenue: 0 };
      itemMap.set(bundle.name, {
        count:   existing.count + qty,
        revenue: parseFloat((existing.revenue + bundle.bundleTotal * qty).toFixed(2)),
      });
    }
  }

  const topItems = Array.from(itemMap.entries())
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { totalRevenue, orderCount, cashRevenue, momoRevenue, cashCount: cashOrders.length, momoCount: momoOrders.length, topItems };
}

/**
 * Filter orders to a date range (ISO strings).
 */
export function filterOrdersByDate(orders: Order[], from: string, to: string): Order[] {
  return orders.filter(o => o.createdAt >= from && o.createdAt <= to);
}

/**
 * Get start-of-today ISO string.
 */
export function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get start of this week (Monday) ISO string.
 */
export function weekStart(): string {
  const d  = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get start of this month ISO string.
 */
export function monthStart(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
