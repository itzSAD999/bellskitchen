// components/admin/OrderDetailsModal.tsx
import React, { useState } from 'react';
import { X, Clock, Banknote, Smartphone, Receipt, Ban, Printer } from 'lucide-react';
import { Order } from '../../types';
import { formatOrderNumber } from '../../utils/orderUtils';
import { useApp } from '../../context/AppContext';
import { submitOrderStatusUpdateWithOfflineSupport, mergeOrderIntoCache } from '../../utils/offlineQueue';
import ReceiptPreviewSheet from '../receipt/ReceiptPreviewSheet';

interface Props {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: Props) {
  const { dispatch } = useApp();
  const [receiptPreview, setReceiptPreview] = useState(false);

  const time = new Date(order.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
  
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleRefund = () => {
    if (window.confirm(`Are you sure you want to void/refund Order #${formatOrderNumber(order.orderNumber)}?`)) {
      const cancelledOrder: Order = { ...order, status: 'cancelled' };
      dispatch({ type: 'CANCEL_PENDING_ORDER', payload: order.id });
      mergeOrderIntoCache(cancelledOrder);
      submitOrderStatusUpdateWithOfflineSupport(order, 'cancelled');
      onClose();
    }
  };

  const handlePrint = () => {
    setReceiptPreview(true);
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-slide-up-fade">
        {/* Header */}
        <div className="bg-dark-50 p-5 flex items-center justify-between border-b border-dark-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
              order.paymentMethod === 'cash' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {order.status === 'cancelled' ? <Ban size={20} /> :
               order.paymentMethod === 'cash' ? <Banknote size={20} /> : <Smartphone size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-black text-dark-950 leading-none">
                Order #{formatOrderNumber(order.orderNumber)}
              </h2>
              <p className="text-xs font-semibold text-dark-500 mt-1">{date} at {time}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-dark-400 hover:text-dark-800 shadow-sm transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto max-h-[60vh]">
          {order.status === 'cancelled' && (
             <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-bold px-4 py-3 rounded-xl mb-4 text-center">
               This order has been VOIDED / REFUNDED.
             </div>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={16} className="text-brand-500" />
            <h3 className="font-bold text-dark-800 text-sm uppercase tracking-widest">Itemized Receipt</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {order.items.map((bundle, i) => (
              <div key={bundle.cartItemId || i} className="bg-dark-50/50 rounded-xl p-3 border border-dark-100 flex justify-between items-start">
                <div>
                  <div className="font-bold text-dark-900 text-sm">
                    {bundle.quantity}x {bundle.name} <span className="text-brand-600">({bundle.size})</span>
                  </div>
                  {bundle.addons.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {bundle.addons.map((addon, j) => (
                        <span key={j} className="text-[10px] bg-dark-100 text-dark-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          + {addon.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="font-black text-dark-900 ml-3">
                  ¢{(bundle.bundleTotal * bundle.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-dark-50 p-5 border-t border-dark-100 flex flex-col gap-4">
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold text-dark-600 uppercase tracking-widest text-sm">Total Amount</span>
            <span className="font-black text-brand-600 text-2xl">¢{order.total.toFixed(2)}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex-1 py-3 rounded-xl border border-dark-200 text-dark-700 font-bold tracking-widest uppercase text-sm hover:bg-dark-100 transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={18} /> Print Receipt
            </button>
            {order.status !== 'cancelled' && (
              <button 
                onClick={handleRefund}
                className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 font-bold tracking-widest uppercase text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
              >
                <Ban size={18} /> Void / Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

      <ReceiptPreviewSheet
        order={order}
        open={receiptPreview}
        onClose={() => setReceiptPreview(false)}
        title="Receipt"
      />
    </>
  );
}
