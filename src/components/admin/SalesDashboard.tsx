// components/admin/SalesDashboard.tsx
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { calcSalesMetrics, filterOrdersByDate, todayStart, weekStart, monthStart } from '../../utils/salesUtils';
import RevenueCard from './RevenueCard';
import PaymentSplit from './PaymentSplit';
import TopItems from './TopItems';
import OrderHistory from './OrderHistory';

type DateFilter = 'today' | 'week' | 'month' | 'all';

const FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'Week'  },
  { key: 'month', label: 'Month' },
  { key: 'all',   label: 'All'   },
];

export default function SalesDashboard() {
  const { state } = useAppContext();
  const [filter, setFilter] = useState<DateFilter>('today');

  const now = new Date().toISOString();
  const filteredOrders = filter === 'all'
    ? state.orders
    : filterOrdersByDate(
        state.orders,
        filter === 'today' ? todayStart()
          : filter === 'week' ? weekStart()
          : monthStart(),
        now
      );

  const metrics = calcSalesMetrics(filteredOrders);

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Date filter pills */}
      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-card">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              filter === f.key
                ? 'bg-brand-500 text-white shadow-warm'
                : 'text-dark-500 hover:text-dark-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {/* Revenue card */}
          <RevenueCard
            totalRevenue={metrics.totalRevenue}
            orderCount={metrics.orderCount}
          />

          {/* Payment split */}
          <PaymentSplit
            cashRevenue={metrics.cashRevenue}
            momoRevenue={metrics.momoRevenue}
            cashCount={metrics.cashCount}
            momoCount={metrics.momoCount}
            totalRevenue={metrics.totalRevenue}
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* Top items */}
          <TopItems items={metrics.topItems} />

          {/* Order history */}
          <OrderHistory orders={filteredOrders} />
        </div>
      </div>
    </div>
  );
}
