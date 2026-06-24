import { MenuItem, Order } from '../types';
import { saveOrderToSupabase, updateOrderStatusInSupabase } from './orderUtils';

export const PENDING_ORDERS_KEY = 'pending_orders';
export const CACHED_MENU_KEY = 'cached_menu_items';
export const CACHED_ORDERS_KEY = 'cached_orders';
export const PENDING_SYNC_CHANGED_EVENT = 'bells-pending-sync-changed';

export type PendingSyncEntry =
  | { kind: 'insert'; order: Order; synced: boolean }
  | {
      kind: 'update';
      orderId: string;
      status: 'completed' | 'cancelled';
      paymentMethod?: 'cash' | 'momo';
      synced: boolean;
    };

function notifyPendingCountChanged(): void {
  window.dispatchEvent(new CustomEvent(PENDING_SYNC_CHANGED_EVENT));
}

function normalizeEntries(raw: unknown): PendingSyncEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): PendingSyncEntry[] => {
    if (item && typeof item === 'object' && 'kind' in item) {
      return [item as PendingSyncEntry];
    }
    if (item && typeof item === 'object' && 'order' in item) {
      const legacy = item as { order: Order; synced: boolean };
      return [{ kind: 'insert', order: legacy.order, synced: legacy.synced }];
    }
    return [];
  });
}

export function getPendingSyncEntries(): PendingSyncEntry[] {
  try {
    const raw = localStorage.getItem(PENDING_ORDERS_KEY);
    if (!raw) return [];
    return normalizeEntries(JSON.parse(raw));
  } catch {
    return [];
  }
}

function savePendingSyncEntries(entries: PendingSyncEntry[]): void {
  localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(entries));
}

/** @deprecated Use getPendingSyncEntries */
export function getPendingOrders(): { order: Order; synced: boolean }[] {
  return getPendingSyncEntries()
    .filter((entry): entry is Extract<PendingSyncEntry, { kind: 'insert' }> => entry.kind === 'insert')
    .map(entry => ({ order: entry.order, synced: entry.synced }));
}

export function getPendingSyncCount(): number {
  return getPendingSyncEntries().filter(entry => !entry.synced).length;
}

export function getUnsyncedOrdersFromQueue(): Order[] {
  return getPendingSyncEntries()
    .filter((entry): entry is Extract<PendingSyncEntry, { kind: 'insert' }> =>
      entry.kind === 'insert' && !entry.synced
    )
    .map(entry => entry.order);
}

function removeSyncEntry(match: PendingSyncEntry): void {
  const entries = getPendingSyncEntries().filter(entry => {
    if (match.kind === 'insert' && entry.kind === 'insert') {
      return entry.order.id !== match.order.id;
    }
    if (match.kind === 'update' && entry.kind === 'update') {
      return !(
        entry.orderId === match.orderId &&
        entry.status === match.status &&
        entry.paymentMethod === match.paymentMethod
      );
    }
    return true;
  });
  savePendingSyncEntries(entries);
  notifyPendingCountChanged();
}

function removeAllSyncEntriesForOrder(orderId: string): void {
  const entries = getPendingSyncEntries().filter(entry => {
    if (entry.kind === 'insert') return entry.order.id !== orderId;
    if (entry.kind === 'update') return entry.orderId !== orderId;
    return true;
  });
  savePendingSyncEntries(entries);
  notifyPendingCountChanged();
}

export function enqueuePendingOrder(order: Order): void {
  const entries = getPendingSyncEntries().filter(
    entry => !(entry.kind === 'insert' && entry.order.id === order.id)
  );
  entries.push({ kind: 'insert', order, synced: false });
  savePendingSyncEntries(entries);
  mergeOrderIntoCache(order);
  notifyPendingCountChanged();
}

export function removePendingOrder(orderId: string): void {
  removeAllSyncEntriesForOrder(orderId);
}

export async function trySyncOrder(order: Order): Promise<boolean> {
  const success = await saveOrderToSupabase(order);
  if (success) {
    removeAllSyncEntriesForOrder(order.id);
  }
  return success;
}

async function trySyncStatusUpdate(entry: Extract<PendingSyncEntry, { kind: 'update' }>): Promise<boolean> {
  const success = await updateOrderStatusInSupabase(
    entry.orderId,
    entry.status,
    entry.paymentMethod
  );
  if (success) {
    removeSyncEntry(entry);
  }
  return success;
}

/**
 * Queue a new order locally, then attempt a Supabase save in the background.
 */
export function submitOrderWithOfflineSupport(order: Order): void {
  enqueuePendingOrder(order);
  void trySyncOrder(order);
}

/**
 * Queue a status change (complete draft / void / cancel) with full offline support.
 * If the original insert is still unsynced, updates that queued snapshot instead.
 */
export function submitOrderStatusUpdateWithOfflineSupport(
  order: Order,
  status: 'completed' | 'cancelled',
  paymentMethod?: 'cash' | 'momo'
): void {
  const updatedOrder: Order = {
    ...order,
    status,
    paymentMethod: paymentMethod ?? order.paymentMethod,
  };

  const entries = getPendingSyncEntries();
  const insertIdx = entries.findIndex(
    entry => entry.kind === 'insert' && entry.order.id === order.id && !entry.synced
  );

  if (insertIdx >= 0) {
    const withoutUpdates = entries.filter(
      entry => !(entry.kind === 'update' && entry.orderId === order.id)
    );
    const insertPos = withoutUpdates.findIndex(
      entry => entry.kind === 'insert' && entry.order.id === order.id
    );
    if (insertPos >= 0) {
      withoutUpdates[insertPos] = { kind: 'insert', order: updatedOrder, synced: false };
    }
    savePendingSyncEntries(withoutUpdates);
    void trySyncOrder(updatedOrder);
  } else {
    const withoutDup = entries.filter(
      entry => !(entry.kind === 'update' && entry.orderId === order.id && !entry.synced)
    );
    const updateEntry: Extract<PendingSyncEntry, { kind: 'update' }> = {
      kind: 'update',
      orderId: order.id,
      status,
      paymentMethod,
      synced: false,
    };
    withoutDup.push(updateEntry);
    savePendingSyncEntries(withoutDup);
    void trySyncStatusUpdate(updateEntry);
  }

  mergeOrderIntoCache(updatedOrder);
  notifyPendingCountChanged();
}

export async function syncAllPendingOrders(): Promise<void> {
  let safety = 0;
  while (safety++ < 50) {
    const pending = getPendingSyncEntries().filter(entry => !entry.synced);
    if (pending.length === 0) break;

    const insert = pending.find(
      (entry): entry is Extract<PendingSyncEntry, { kind: 'insert' }> => entry.kind === 'insert'
    );
    if (insert) {
      await trySyncOrder(insert.order);
      continue;
    }

    const update = pending.find(
      (entry): entry is Extract<PendingSyncEntry, { kind: 'update' }> => entry.kind === 'update'
    );
    if (update) {
      await trySyncStatusUpdate(update);
      continue;
    }

    break;
  }
  notifyPendingCountChanged();
}

export function cacheMenuItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(CACHED_MENU_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to cache menu items:', err);
  }
}

export function getCachedMenuItems(): MenuItem[] | null {
  try {
    const raw = localStorage.getItem(CACHED_MENU_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function cacheOrders(orders: Order[]): void {
  try {
    localStorage.setItem(CACHED_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Failed to cache orders:', err);
  }
}

export function getCachedOrders(): Order[] | null {
  try {
    const raw = localStorage.getItem(CACHED_ORDERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function mergeOrderIntoCache(order: Order): void {
  const cached = getCachedOrders() ?? [];
  const idx = cached.findIndex(o => o.id === order.id);
  if (idx >= 0) {
    cached[idx] = order;
  } else {
    cached.unshift(order);
  }
  cacheOrders(cached);
}

export function mergeOrdersWithLocal(serverOrders: Order[], localOrders: Order[]): Order[] {
  const byId = new Map(serverOrders.map(order => [order.id, order]));

  for (const local of localOrders) {
    const hasPendingSync = getPendingSyncEntries().some(entry => {
      if (!entry.synced && entry.kind === 'insert' && entry.order.id === local.id) return true;
      if (!entry.synced && entry.kind === 'update' && entry.orderId === local.id) return true;
      return false;
    });

    if (!byId.has(local.id) || hasPendingSync) {
      byId.set(local.id, local);
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
