// components/cashier/MenuCard.tsx
import React from 'react';
import { Utensils, Flame, Layers, Fish, Sparkles, ChefHat } from 'lucide-react';
import { MenuItem } from '../../types';

// Curated modern vector icon and gradient themes for mains
const ITEM_THEMES: Record<string, { icon: React.ComponentType<any>; bgClass: string; textClass: string }> = {
  'item_001': {
    icon: Utensils,
    bgClass: 'bg-gradient-to-tr from-amber-500/15 to-orange-500/10 border-orange-100/50',
    textClass: 'text-orange-600',
  },
  'item_002': {
    icon: Flame,
    bgClass: 'bg-gradient-to-tr from-red-500/15 to-orange-500/10 border-red-100/50',
    textClass: 'text-red-600',
  },
  'item_003': {
    icon: Layers,
    bgClass: 'bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 border-emerald-100/50',
    textClass: 'text-emerald-600',
  },
  'item_004': {
    icon: Fish,
    bgClass: 'bg-gradient-to-tr from-sky-500/15 to-blue-500/10 border-sky-100/50',
    textClass: 'text-blue-600',
  },
  'item_005': {
    icon: Sparkles,
    bgClass: 'bg-gradient-to-tr from-purple-500/15 to-indigo-500/10 border-purple-100/50',
    textClass: 'text-purple-600',
  },
  'item_006': {
    icon: ChefHat,
    bgClass: 'bg-gradient-to-tr from-rose-500/15 to-pink-500/10 border-rose-100/50',
    textClass: 'text-rose-600',
  },
};

const DEFAULT_THEME = {
  icon: Utensils,
  bgClass: 'bg-gradient-to-tr from-dark-500/15 to-dark-500/10 border-dark-100/50',
  textClass: 'text-dark-600',
};

interface Props {
  item: MenuItem;
  onTap: (item: MenuItem, size: 'S'|'M'|'L', customPrice?: number) => void;
}

export default function MenuCard({ item, onTap }: Props) {
  const priceDisplay = (() => {
    if (item.hasSizes) {
      const prices = (['S', 'M', 'L'] as const)
        .map(size => item.prices[size])
        .filter((p): p is number => p !== undefined);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return min === max ? `¢${min}` : `¢${min} - ¢${max}`;
      }
      return '¢0';
    }
    return `¢${item.prices.fixed ?? 0}`;
  })();

  const theme = ITEM_THEMES[item.id] || DEFAULT_THEME;
  const IconComponent = theme.icon;

  return (
    <div
      className={`
        relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-150 text-left w-full select-none
        ${item.available
          ? 'bg-white border-dark-100 hover:border-brand-500 hover:shadow-lg shadow-sm'
          : 'bg-dark-50/50 border-dark-100 opacity-50'
        }
      `}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={`
          w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center text-xl shadow-inner
          ${item.available ? theme.bgClass : 'bg-dark-100 border-dark-200 text-dark-400'}
        `}>
          <IconComponent className={item.available ? theme.textClass : 'text-dark-400'} size={18} strokeWidth={2.5} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-dark-950 text-sm uppercase tracking-wide leading-tight truncate">
            {item.name}
          </h3>
          <span className="text-brand-500 font-black text-sm leading-none">
            {priceDisplay}
          </span>
        </div>
      </div>

      {item.available && (
        <div className="w-full mt-3 pt-3 border-t border-dark-100/30 flex gap-2">
          {item.hasSizes ? (
            (['S', 'M', 'L'] as const).map(size => (
              item.prices[size] !== undefined && (
                <button
                  key={size}
                  onClick={(e) => { e.stopPropagation(); onTap(item, size, item.prices[size]); }}
                  className="flex-1 py-2 bg-dark-50 hover:bg-brand-50 text-dark-800 hover:text-brand-600 rounded-lg text-xs font-bold transition-colors border border-dark-100 hover:border-brand-200"
                >
                  {size} - ¢{item.prices[size]}
                </button>
              )
            ))
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onTap(item, 'M', item.prices.fixed); }}
              className="w-full py-2 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-colors border border-brand-200"
            >
              Add to Order
            </button>
          )}
        </div>
      )}

      {/* Sold out badge */}
      {!item.available && (
        <span className="absolute top-3 right-3 bg-red-100 text-red-600 border border-red-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
          Sold Out
        </span>
      )}
    </div>
  );
}
