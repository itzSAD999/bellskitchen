import { BundleItem, Order } from '../types';
import { supabase } from '../lib/supabase';

/**
 * Calculate the running total of all bundles in the cart.
 */
export function calcCartTotal(cart: BundleItem[]): number {
  return parseFloat(cart.reduce((sum, b) => sum + b.bundleTotal * b.quantity, 0).toFixed(2));
}

/**
 * Calculate bundle total = base price + sum of all addon prices.
 */
export function calcBundleTotal(basePrice: number, addonPrices: number[]): number {
  return parseFloat((basePrice + addonPrices.reduce((s, p) => s + p, 0)).toFixed(2));
}

/**
 * Generate a short UUID for cart item IDs.
 */
export function generateCartId(): string {
  return crypto.randomUUID();
}

/**
 * Format a number as Ghana Cedis: ¢40.00
 */
export function formatGHS(amount: number): string {
  return `¢${amount.toFixed(2)}`;
}

/**
 * Phase 2: Calculate 1% platform fee split.
 */
export function calculatePlatformFee(total: number, feePct = 0.01) {
  const platformFee  = parseFloat((total * feePct).toFixed(2));
  const vendorAmount = parseFloat((total - platformFee).toFixed(2));
  return { platformFee, vendorAmount };
}

/**
 * Format an order number to a zero-padded 4-digit string, e.g. 47 → "0047"
 */
export function formatOrderNumber(n: number): string {
  return String(n).padStart(4, '0');
}

/**
 * Format a daily count number as zero-padded: e.g. 5 → "05"
 */
export function formatDailyOrderNumber(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Calculate the daily order sequence number (daily count) for a given order.
 * Searches the orders array to count how many orders occurred on the same calendar day.
 */
export function getDailyOrderNumber(order: Order, allOrders: Order[]): number {
  const currentLocalDate = new Date(order.createdAt).toDateString();
  
  // Filter all orders created on the same day
  const sameDayOrders = allOrders.filter(o => {
    return new Date(o.createdAt).toDateString() === currentLocalDate;
  });
  
  // Sort them ascending by date / timestamp
  sameDayOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  // Find the index of the current order in the sorted list
  const index = sameDayOrders.findIndex(o => o.id === order.id);
  
  // If found, index + 1 is its sequence number.
  // If not found (e.g. it is a new order not yet in list), return sameDayOrders.length + 1.
  if (index === -1) {
    return sameDayOrders.length + 1;
  }
  return index + 1;
}

/**
 * Get the daily ticket number for the next order being placed.
 */
export function getNextDailyNumber(allOrders: Order[]): number {
  const todayStr = new Date().toDateString();
  const todayCount = allOrders.filter(o => new Date(o.createdAt).toDateString() === todayStr).length;
  return todayCount + 1;
}

/**
 * Saves a completed order, its items, and addons to Supabase.
 * Returns true if saved successfully, or false if it failed / fell back (offline/placeholder).
 */
export async function saveOrderToSupabase(order: Order): Promise<boolean> {
  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
  if (isPlaceholder) {
    console.warn('Supabase is placeholder or unset; skipping remote database insert.');
    return false;
  }

  try {
    // 1. Get and increment order number from settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single();

    let orderNum = order.orderNumber;
    if (!settingsError && settingsData) {
      orderNum = settingsData.next_order_number;
      await supabase
        .from('settings')
        .update({ next_order_number: orderNum + 1 })
        .eq('id', settingsData.id);
    }

    // 2. Insert order header
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: order.id,
        order_number: orderNum,
        total: order.total,
        payment_method: order.paymentMethod,
        status: order.status,
        created_at: order.createdAt
      });

    if (orderError) throw orderError;

    // 3. Insert order items
    for (const bundle of order.items) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          id: bundle.cartItemId,
          order_id: order.id,
          menu_item_id: bundle.menuItemId,
          name: bundle.name,
          size: bundle.size,
          base_price: bundle.basePrice,
          bundle_total: bundle.bundleTotal,
          created_at: order.createdAt
        });

      if (itemError) throw itemError;

      // 4. Insert addons
      if (bundle.addons.length > 0) {
        const { error: addonsError } = await supabase
          .from('order_item_addons')
          .insert(
            bundle.addons.map(a => ({
              order_item_id: bundle.cartItemId,
              menu_item_id: a.menuItemId,
              name: a.name,
              price: a.price
            }))
          );

        if (addonsError) throw addonsError;
      }
    }

    return true;
  } catch (err) {
    console.error('Error saving order to Supabase:', err);
    return false;
  }
}

/**
 * Updates the status and optionally payment method of an order in Supabase.
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  status: 'completed' | 'cancelled',
  paymentMethod?: 'cash' | 'momo'
): Promise<boolean> {
  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
  if (isPlaceholder) {
    console.warn('Supabase is placeholder or unset; skipping remote database update.');
    return false;
  }

  try {
    const updateData: Record<string, unknown> = { status };
    if (paymentMethod) {
      updateData.payment_method = paymentMethod;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating order status in Supabase:', err);
    return false;
  }
}

