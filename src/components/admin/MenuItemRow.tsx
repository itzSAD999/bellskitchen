// components/admin/MenuItemRow.tsx
import React, { useState } from 'react';
import { Check, X, ToggleLeft, ToggleRight, Edit2, Utensils, Flame, Layers, Fish, Sparkles, ChefHat, PlusCircle } from 'lucide-react';
import { MenuItem } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

// Curated vector icon and gradient themes to match the cashier view
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
  icon: PlusCircle,
  bgClass: 'bg-gradient-to-tr from-brand-500/15 to-amber-500/10 border-brand-100/50',
  textClass: 'text-brand-600',
};

interface Props {
  item: MenuItem;
}

export default function MenuItemRow({ item }: Props) {
  const { dispatch } = useAppContext();
  const [editing, setEditing]   = useState(false);
  const [prices, setPrices]     = useState(item.prices);

  const handleToggleAvailable = async () => {
    dispatch({ type: 'TOGGLE_AVAILABLE', payload: item.id });
    try {
      await supabase.from('menu_items')
        .update({ available: !item.available })
        .eq('id', item.id);
    } catch { /* optimistic update already applied */ }
  };

  const handleSavePrices = async () => {
    const update: Record<string, number | undefined> = {};
    if (item.hasSizes) {
      update.price_s = prices.S;
      update.price_m = prices.M;
      update.price_l = prices.L;
    } else {
      update.price_fixed = prices.fixed;
    }

    dispatch({ type: 'UPDATE_MENU_ITEM', payload: { id: item.id, prices } });
    try {
      await supabase.from('menu_items').update(update).eq('id', item.id);
    } catch { /* ignore */ }
    setEditing(false);
  };

  const theme = ITEM_THEMES[item.id] || DEFAULT_THEME;
  const IconComponent = theme.icon;

  return (
    <div className={`bg-white rounded-2xl p-4 border transition-all duration-200 shadow-sm select-none ${
      item.available 
        ? 'border-dark-100/80 hover:border-brand-200' 
        : 'border-red-100/80 bg-red-50/5 opacity-80'
    }`}>
      <div className="flex items-center gap-3">
        {/* Visual Badge wrapper for Vector Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-colors ${
          item.available ? theme.bgClass : 'bg-dark-100 border-dark-200'
        }`}>
          <IconComponent size={18} className={item.available ? theme.textClass : 'text-dark-400'} />
        </div>

        {/* Name + category */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-dark-900 text-sm truncate leading-tight select-none">
            {item.name}
          </p>
          <p className="text-[10px] text-dark-400 font-extrabold uppercase tracking-widest mt-0.5 select-none">
            {item.category}
          </p>
        </div>

        {/* Prices area */}
        <div className="flex-shrink-0">
          {!editing ? (
            <div>
              {item.hasSizes ? (
                <div className="flex gap-1 text-[10px] font-black text-dark-600 select-none">
                  <span className="bg-dark-50 px-2 py-1 rounded-lg border border-dark-100/50">S: ¢{item.prices.S}</span>
                  <span className="bg-dark-50 px-2 py-1 rounded-lg border border-dark-100/50">M: ¢{item.prices.M}</span>
                  <span className="bg-dark-50 px-2 py-1 rounded-lg border border-dark-100/50">L: ¢{item.prices.L}</span>
                </div>
              ) : (
                <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-100/50 text-xs font-black select-none">
                  ¢{item.prices.fixed}
                </span>
              )}
            </div>
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {item.hasSizes ? (
                (['S', 'M', 'L'] as const).map(s => (
                  <div key={s} className="relative flex items-center">
                    <span className="absolute left-2 text-[9px] font-black text-dark-400 uppercase select-none">{s}</span>
                    <input
                      type="number"
                      value={prices[s] ?? ''}
                      onChange={e => setPrices(p => ({ ...p, [s]: Number(e.target.value) }))}
                      className="w-14 input text-xs py-1.5 pl-4.5 pr-0.5 text-center font-bold text-brand-600 rounded-xl"
                      placeholder={s}
                    />
                  </div>
                ))
              ) : (
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-[9px] font-black text-dark-400 select-none">¢</span>
                  <input
                    type="number"
                    value={prices.fixed ?? ''}
                    onChange={e => setPrices(p => ({ ...p, fixed: Number(e.target.value) }))}
                    className="w-18 input text-xs py-1.5 pl-4.5 pr-0.5 font-bold text-brand-600 rounded-xl"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions panel */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {editing ? (
            <div className="flex gap-1">
              <button
                onClick={handleSavePrices}
                className="p-1.5 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 active:scale-90 transition-all cursor-pointer"
              >
                <Check size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => { setEditing(false); setPrices(item.prices); }}
                className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 active:scale-90 transition-all cursor-pointer"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-xl hover:bg-brand-50 border border-transparent hover:border-brand-200 text-dark-400 hover:text-brand-600 active:scale-90 transition-all cursor-pointer"
            >
              <Edit2 size={14} />
            </button>
          )}

          <button
            onClick={handleToggleAvailable}
            className="p-0.5 active:scale-90 transition-all cursor-pointer"
          >
            {item.available ? (
              <ToggleRight size={26} className="text-brand-500" strokeWidth={1.5} />
            ) : (
              <ToggleLeft size={26} className="text-dark-300" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
