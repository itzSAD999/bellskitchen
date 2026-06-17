// components/admin/OrderHistory.tsx
import React from 'react';
import { Clock, Banknote, Smartphone } from 'lucide-react';
import { Order } from '../../types';
import { formatOrderNumber } from '../../utils/orderUtils';

interface Props {
  orders: Order[];
}

export default function OrderHistory({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="card text-center py-6 text-dark-400">
        <Clock size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No orders in this period</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-brand-500" />
        <h3 className="font-bold text-dark-800">Order History</h3>
        <span className="ml-auto badge">{orders.length} orders</span>
      </div>
      <div className="flex flex-col divide-y divide-brand-50">
        {orders.map(order => {
          const time = new Date(order.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true,
          });
          return (
            <div key={order.id} className={`py-3 flex items-center gap-3 ${order.status === 'cancelled' ? 'opacity-50' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                order.paymentMethod === 'cash' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {order.paymentMethod === 'cash'
                  ? <Banknote size={15} className="text-green-600" />
                  : <Smartphone size={15} className="text-yellow-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-dark-900 text-sm">
                    #{formatOrderNumber(order.orderNumber)}
                  </span>
                  {order.status === 'cancelled' && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">VOID</span>
                  )}
                </div>
                <p className="text-xs text-dark-400">
                  {time} · {order.items.length} bundle{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="font-bold text-dark-900">¢{order.total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
