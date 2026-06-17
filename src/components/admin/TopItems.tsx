// components/admin/TopItems.tsx
import React from 'react';
import { Trophy } from 'lucide-react';

interface TopItem {
  name:    string;
  count:   number;
  revenue: number;
}

interface Props {
  items: TopItem[];
}

const RANK_COLORS = [
  'bg-yellow-400 text-yellow-900',
  'bg-dark-300 text-white',
  'bg-amber-600 text-white',
];

export default function TopItems({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="card text-center py-6 text-dark-400">
        <Trophy size={28} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No sales data yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={16} className="text-brand-500" />
        <h3 className="font-bold text-dark-800">Top Items</h3>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${RANK_COLORS[idx] ?? 'bg-brand-100 text-brand-700'}`}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-dark-900 text-sm truncate">{item.name}</p>
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 bg-brand-400 rounded-full"
                  style={{ width: `${Math.min((item.count / items[0].count) * 100, 100)}%`, minWidth: '8px' }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-dark-900 text-sm">{item.count}×</p>
              <p className="text-xs text-dark-400">¢{item.revenue.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
