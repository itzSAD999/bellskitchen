// hooks/useOrders.ts
// Fetches orders (with items + addons) from Supabase.
// Caches locally and merges unsynced offline orders on load.

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { Order, BundleItem, AddOn } from '../types';
import {
  cacheOrders,
  getCachedOrders,
  getUnsyncedOrdersFromQueue,
  mergeOrdersWithLocal,
} from '../utils/offlineQueue';

function mapOrder(row: Record<string, unknown>): Order {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: BundleItem[] = ((row.order_items as any[]) ?? []).map((oi: any) => ({
    cartItemId:  oi.id,
    menuItemId:  oi.menu_item_id,
    name:        oi.name,
    size:        oi.size as 'S' | 'M' | 'L',
    basePrice:   Number(oi.base_price),
    bundleTotal: Number(oi.bundle_total),
    quantity:    1,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addons: ((oi.order_item_addons as any[]) ?? []).map((a: any): AddOn => ({
      menuItemId: a.menu_item_id,
      name:       a.name,
      price:      Number(a.price),
    })),
  }));

  return {
    id:            row.id as string,
    orderNumber:   row.order_number as number,
    items,
    total:         Number(row.total),
    paymentMethod: row.payment_method as 'cash' | 'momo' | 'card',
    status:        row.status as 'completed' | 'cancelled' | 'pending',
    paystackRef:   row.paystack_ref as string | undefined,
    platformFee:   row.platform_fee ? Number(row.platform_fee) : undefined,
    vendorAmount:  row.vendor_amount ? Number(row.vendor_amount) : undefined,
    source:        row.source as 'in_person' | 'online',
    printed:       row.printed as boolean,
    createdAt:     row.created_at as string,
  };
}

export function useOrders() {
  const { dispatch } = useAppContext();

  useEffect(() => {
    let cancelled = false;

    const cached = getCachedOrders() ?? [];
    const queued = getUnsyncedOrdersFromQueue();
    const initial = mergeOrdersWithLocal(cached, queued);
    if (initial.length > 0) {
      dispatch({ type: 'SET_ORDERS', payload: initial });
    }

    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, order_item_addons(*))')
        .order('created_at', { ascending: false })
        .limit(200);

      if (cancelled) return;

      if (error) {
        console.warn('Could not fetch orders from Supabase:', error.message);
        if (initial.length > 0) return;
        const fallback = mergeOrdersWithLocal([], getUnsyncedOrdersFromQueue());
        if (fallback.length > 0) {
          dispatch({ type: 'SET_ORDERS', payload: fallback });
        }
        return;
      }

      const serverOrders = (data ?? []).map(mapOrder);
      const merged = mergeOrdersWithLocal(serverOrders, [
        ...getUnsyncedOrdersFromQueue(),
        ...(getCachedOrders() ?? []).filter(
          cachedOrder => !serverOrders.some(serverOrder => serverOrder.id === cachedOrder.id)
        ),
      ]);
      dispatch({ type: 'SET_ORDERS', payload: merged });
      cacheOrders(merged);
    }

    fetchOrders();
    return () => { cancelled = true; };
  }, [dispatch]);
}
