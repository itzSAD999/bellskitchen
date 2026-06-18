// components/receipt/ReceiptModal.tsx
import React from 'react';
import { Printer, RotateCcw, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ReceiptView from './ReceiptView';
import { formatOrderNumber } from '../../utils/orderUtils';

export default function ReceiptModal() {
  const { state, dispatch } = useApp();
  const order = state.currentOrder;

  if (!order) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    const dateStr = new Date().toISOString().split('T')[0];
    document.title = `Receipt_BellsKitchen_Order_${formatOrderNumber(order.orderNumber)}_${dateStr}`;
    window.print();
    // Use setTimeout to ensure the print dialog reads the title before restoring
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleCancelOrder = () => {
    // CANCEL_ORDER marks currentOrder as cancelled and clears the cart.
    // Supabase update (status → 'cancelled') will be added in the Supabase wiring step.
    dispatch({ type: 'CANCEL_ORDER' });
  };

  const handleNewOrder = () => {
    dispatch({ type: 'NEW_ORDER' });
  };

  return (
    <div className="modal-overlay print:bg-white print:p-0 print:block">
      <div className="modal-card w-full max-w-sm flex flex-col max-h-[90vh] print:border-none print:shadow-none print:bg-white print:max-w-none print:w-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500 to-amber-500 px-5 py-4 rounded-t-3xl flex-shrink-0 print:hidden">
          <h2 className="text-white font-bold text-lg">Order Confirmed! 🎉</h2>
          <p className="text-brand-100 text-sm">
            #{formatOrderNumber(order.orderNumber)} · ¢{order.total.toFixed(2)} · {order.paymentMethod.toUpperCase()}
          </p>
        </div>

        {/* Receipt preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 print:bg-white print:p-0">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm overflow-x-auto print:border-none print:p-0 print:shadow-none">
            <ReceiptView order={order} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 flex flex-col gap-2 border-t border-brand-50 bg-white rounded-b-3xl flex-shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Print Receipt
          </button>

          <button
            onClick={handleNewOrder}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            New Order
          </button>

          <button
            onClick={handleCancelOrder}
            className="btn-danger flex items-center justify-center gap-2"
          >
            <XCircle size={18} />
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}
