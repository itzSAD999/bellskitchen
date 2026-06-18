// components/receipt/ReceiptView.tsx
// Formatted for 58mm thermal printer (as per SPEC.md Section 9).
// The .receipt-view class is targeted by print.css @media print rules.

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order, AddOn } from '../../types';
import { formatOrderNumber, getDailyOrderNumber, formatDailyOrderNumber } from '../../utils/orderUtils';

interface Props {
  order: Order;
}

function Divider({ char = '─' }: { char?: string }) {
  return <div className="font-mono text-xs my-1">{char.repeat(32)}</div>;
}

function DoubleDivider() {
  return <div className="font-mono text-xs my-1">{'═'.repeat(32)}</div>;
}

export default function ReceiptView({ order }: Props) {
  const { state } = useAppContext();
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="receipt-view font-mono text-xs leading-snug">
      <DoubleDivider />
      <div className="text-center font-bold text-sm tracking-widest my-1">BELLS KITCHEN</div>
      <DoubleDivider />

      <div className="border border-black font-bold text-center py-1.5 my-1.5 text-sm uppercase tracking-widest">
        Ticket: #{formatDailyOrderNumber(getDailyOrderNumber(order, state.orders))}
      </div>
      <div className="text-center text-[10px] text-gray-700 leading-none mb-2">
        Order Ref: #{formatOrderNumber(order.orderNumber)}
      </div>
      <div>Date: {dateStr}&nbsp;&nbsp;&nbsp;Time: {timeStr}</div>

      <Divider />

      {order.items.map((bundle, idx) => {
        // Group duplicate addons for clean printing
        const groupedAddons = bundle.addons.reduce((acc, curr) => {
          const existing = acc.find(x => x.menuItemId === curr.menuItemId);
          if (existing) {
            existing.quantity += 1;
            existing.totalPrice += curr.price;
          } else {
            acc.push({ ...curr, quantity: 1, totalPrice: curr.price });
          }
          return acc;
        }, [] as Array<AddOn & { quantity: number; totalPrice: number }>);

        const qtyPrefix = bundle.quantity > 1 ? `${bundle.quantity} × ` : '';
        const baseLineTotal = bundle.basePrice * bundle.quantity;
        const totalBundleCost = bundle.bundleTotal * bundle.quantity;

        const mainItem = [...state.menu, ...state.addons].find(m => m.id === bundle.menuItemId);
        const showSize = mainItem?.hasSizes ?? true;
        const sizeSuffix = showSize ? ` (${bundle.size})` : '';

        return (
          <div key={bundle.cartItemId} className="mb-2">
            <div className="flex justify-between">
              <span className="font-semibold">{qtyPrefix}{bundle.name}{sizeSuffix}</span>
              <span>¢{baseLineTotal.toFixed(2)}</span>
            </div>
            {groupedAddons.length > 0 && (
              <div className="pl-3 text-[10px] leading-tight text-gray-800">
                <span className="font-semibold">Add-ons:</span>
                {groupedAddons.map((addon) => {
                  const qtyPerPack = addon.quantity;
                  const totalQty = qtyPerPack * bundle.quantity;
                  const addonLabel = bundle.quantity > 1
                    ? `${qtyPerPack} per pack · ${totalQty} total`
                    : qtyPerPack > 1 ? `x${qtyPerPack}` : '';

                  return (
                    <div key={addon.menuItemId} className="flex justify-between">
                      <span>+{addon.name}{addonLabel ? ` (${addonLabel})` : ''}</span>
                      <span>¢{(addon.totalPrice * bundle.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between font-semibold mt-0.5">
              <span className="pl-2">Subtotal:</span>
              <span>¢{totalBundleCost.toFixed(2)}</span>
            </div>
            {idx < order.items.length - 1 && <div className="mt-1" />}
          </div>
        );
      })}

      <Divider />

      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL:</span>
        <span>¢{order.total.toFixed(2)}</span>
      </div>
      <div>Payment: {order.paymentMethod.toUpperCase()}</div>

      {order.paystackRef && (
        <div className="text-xs">Ref: {order.paystackRef}</div>
      )}

      <Divider />

      <div className="text-center mt-1 mb-0.5">Thank you! Come again :)</div>
      <DoubleDivider />
    </div>
  );
}
