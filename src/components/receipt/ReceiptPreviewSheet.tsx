import React from 'react';
import { Printer, X } from 'lucide-react';
import { Order } from '../../types';
import ReceiptView from './ReceiptView';
import {
  formatOrderNumber,
  formatDailyOrderNumber,
  getDailyOrderNumber,
} from '../../utils/orderUtils';
import { useAppContext } from '../../context/AppContext';

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onPrinted?: () => void;
  title?: string;
}

export default function ReceiptPreviewSheet({
  order,
  open,
  onClose,
  onPrinted,
  title = 'Receipt Preview',
}: Props) {
  const { state } = useAppContext();

  if (!open || !order) return null;

  const ticketNum = formatDailyOrderNumber(getDailyOrderNumber(order, state.orders));
  const orderRef = formatOrderNumber(order.orderNumber);

  const handlePrint = () => {
    const originalTitle = document.title;
    const date = new Date(order.createdAt);
    const dateStr = date
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');
    document.title = `Order_${orderRef}_Ticket_${ticketNum}_${dateStr}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 500);

    onPrinted?.();
  };

  return (
    <div className="receipt-preview-sheet fixed inset-0 z-[200] flex items-end sm:items-center justify-center print:static print:inset-auto print:z-auto">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm print:hidden"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full sm:max-w-lg max-h-[94dvh] bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up print:shadow-none print:rounded-none print:max-h-none print:w-full print:bg-white">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3 flex-shrink-0 print:hidden">
          <div>
            <h2 className="text-lg font-black text-[#431407] tracking-tight">{title}</h2>
            <p className="text-xs font-bold text-gray-500 mt-1">
              Ticket #{ticketNum} · Order #{orderRef}
              {order.source === 'online' && (
                <span className="ml-1.5 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Online
                </span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
              Preview below — tap Print when ready
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0"
            aria-label="Close receipt preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f3f4f6] print:p-0 print:bg-white print:overflow-visible">
          <div className="mx-auto w-full max-w-[240px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200/80 rounded-xl p-4 print:shadow-none print:border-none print:rounded-none print:max-w-none print:mx-0 print:p-0">
            <ReceiptView order={order} />
          </div>
        </div>

        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white flex gap-2 flex-shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-black text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-[1.4] py-3.5 rounded-xl bg-[#431407] hover:bg-[#2a0e05] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md active:scale-[0.98]"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
