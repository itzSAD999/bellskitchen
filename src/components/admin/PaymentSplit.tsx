// components/admin/PaymentSplit.tsx
import React from 'react';
import { Banknote, Smartphone } from 'lucide-react';

interface Props {
  cashRevenue:  number;
  momoRevenue:  number;
  cashCount:    number;
  momoCount:    number;
  totalRevenue: number;
}

export default function PaymentSplit({ cashRevenue, momoRevenue, cashCount, momoCount, totalRevenue }: Props) {
  const cashPct = totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0;
  const momoPct = 100 - cashPct;

  return (
    <div className="card">
      <h3 className="font-bold text-dark-800 mb-3">Payment Split</h3>

      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-4 mb-4 bg-dark-100">
        {cashPct > 0 && (
          <div
            className="bg-green-500 transition-all duration-500 flex items-center justify-center"
            style={{ width: `${cashPct}%` }}
          />
        )}
        {momoPct > 0 && (
          <div
            className="bg-yellow-400 transition-all duration-500 flex items-center justify-center"
            style={{ width: `${momoPct}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        <div className="flex-1 bg-green-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <Banknote size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">Cash</span>
            <span className="ml-auto text-xs font-bold text-green-700">{cashPct}%</span>
          </div>
          <p className="font-bold text-green-800">¢{cashRevenue.toFixed(2)}</p>
          <p className="text-xs text-green-600">{cashCount} order{cashCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 bg-yellow-50 rounded-xl p-3 border border-yellow-100">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone size={14} className="text-yellow-700" />
            <span className="text-xs font-semibold text-yellow-700">MoMo</span>
            <span className="ml-auto text-xs font-bold text-yellow-700">{momoPct}%</span>
          </div>
          <p className="font-bold text-yellow-800">¢{momoRevenue.toFixed(2)}</p>
          <p className="text-xs text-yellow-600">{momoCount} order{momoCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  );
}
