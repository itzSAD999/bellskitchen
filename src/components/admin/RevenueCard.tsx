// components/admin/RevenueCard.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface Props {
  totalRevenue: number;
  orderCount:   number;
}

export default function RevenueCard({ totalRevenue, orderCount }: Props) {
  const avgOrder = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : '0.00';

  return (
    <div className="bg-gradient-to-br from-brand-500 to-amber-500 rounded-2xl p-5 shadow-warm-lg text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-brand-100 text-sm font-medium">Total Revenue</p>
          <h2 className="text-4xl font-black mt-1">¢{totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="bg-white/20 rounded-xl p-2.5">
          <TrendingUp size={24} />
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <div>
          <p className="text-brand-100">Orders</p>
          <p className="font-bold text-lg">{orderCount}</p>
        </div>
        <div>
          <p className="text-brand-100">Avg. Order</p>
          <p className="font-bold text-lg">¢{avgOrder}</p>
        </div>
      </div>
    </div>
  );
}
