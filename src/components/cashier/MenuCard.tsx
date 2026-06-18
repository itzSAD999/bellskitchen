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
  onTap: (item: MenuItem) => void;
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
    <button
      onClick={() => item.available && onTap(item)}
      disabled={!item.available}
      className={`
        relative flex flex-col items-start p-6 rounded-[2rem] border-2 transition-all duration-300 text-left w-full select-none
        ${item.available
          ? 'bg-white border-dark-100/50 hover:border-brand-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer active:scale-95 shadow-md'
          : 'bg-dark-50/50 border-dark-100 opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* Visual Badge wrapper for Vector Icon */}
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-5 shadow-inner transition-colors
        ${item.available ? theme.bgClass : 'bg-dark-100 border-dark-200 text-dark-400'}
      `}>
        <IconComponent className={item.available ? theme.textClass : 'text-dark-400'} size={24} strokeWidth={2.5} />
      </div>

      {/* Name */}
      <h3 className="font-black text-dark-950 text-[15px] uppercase tracking-wide leading-tight mb-2 select-none">
        {item.name}
      </h3>

      {/* Price & sizes */}
      <div className="flex flex-col gap-1.5 w-full mt-auto pt-4 border-t-2 border-dark-100/30">
        <span className="text-brand-500 font-black text-xl leading-none select-none">
          {priceDisplay}
        </span>
        {item.hasSizes && (
          <span className="text-[10px] text-dark-400 font-bold uppercase tracking-[0.1em] select-none">
            Sizes: S · M · L
          </span>
        )}
      </div>

      {/* Sold out badge */}
      {!item.available && (
        <span className="absolute top-4 right-4 bg-red-100 text-red-600 border border-red-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          Sold Out
        </span>
      )}
    </button>
  );
}
