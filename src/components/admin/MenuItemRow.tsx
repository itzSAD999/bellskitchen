// components/admin/MenuItemRow.tsx
import React, { useState } from 'react';
import { Check, X, ToggleLeft, ToggleRight, Edit2, Utensils, Flame, Layers, Fish, Sparkles, ChefHat, PlusCircle, Trash2 } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    description: item.description || '',
    imageUrl: item.imageUrl || '',
  });
  const [prices, setPrices] = useState(item.prices);

  const handleToggleAvailable = async () => {
    dispatch({ type: 'TOGGLE_AVAILABLE', payload: item.id });
    try {
      await supabase.from('menu_items')
        .update({ available: !item.available })
        .eq('id', item.id);
    } catch { /* optimistic update already applied */ }
  };

  const handleSave = async () => {
    const update: any = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      image_url: formData.imageUrl
    };
    if (item.hasSizes) {
      update.price_s = prices.S;
      update.price_m = prices.M;
      update.price_l = prices.L;
    } else {
      update.price_fixed = prices.fixed;
    }

    dispatch({ type: 'UPDATE_MENU_ITEM', payload: { id: item.id, ...formData, prices } });
    try {
      await supabase.from('menu_items').update(update).eq('id', item.id);
    } catch { /* ignore */ }
    setEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      dispatch({ type: 'DELETE_MENU_ITEM', payload: item.id });
      try {
        await supabase.from('menu_items').delete().eq('id', item.id);
      } catch { /* optimistic */ }
    }
  };

  const theme = ITEM_THEMES[item.id] || DEFAULT_THEME;
  const IconComponent = theme.icon;

  if (editing) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-brand-300 shadow-warm transition-all duration-200 select-none">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black text-brand-600">Edit Menu Item</h3>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-all cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-dark-500">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input text-sm py-2" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-dark-500">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as 'main' | 'addon' })} className="input text-sm py-2 bg-white">
                <option value="main">Main</option>
                <option value="addon">Add-on</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-dark-500">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input text-sm py-2 h-16 resize-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-dark-500">Image URL</label>
            <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="input text-sm py-2" />
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-dark-500">Prices</label>
            <div className="flex gap-2 flex-wrap">
              {item.hasSizes ? (
                (['S', 'M', 'L'] as const).map(s => (
                  <div key={s} className="relative flex items-center">
                    <span className="absolute left-3 text-[10px] font-black text-dark-400 uppercase select-none">{s}</span>
                    <input type="number" value={prices[s] ?? ''} onChange={e => setPrices(p => ({ ...p, [s]: Number(e.target.value) }))} className="w-20 input text-sm py-2 pl-6 pr-2 text-center font-bold text-brand-600" placeholder={s} />
                  </div>
                ))
              ) : (
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[10px] font-black text-dark-400 select-none">¢</span>
                  <input type="number" value={prices.fixed ?? ''} onChange={e => setPrices(p => ({ ...p, fixed: Number(e.target.value) }))} className="w-24 input text-sm py-2 pl-6 pr-2 font-bold text-brand-600" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-dark-100/50">
            <button onClick={() => { setEditing(false); setPrices(item.prices); setFormData({name: item.name, category: item.category, description: item.description||'', imageUrl: item.imageUrl||''}); }} className="px-4 py-2 rounded-xl text-xs font-bold text-dark-500 hover:bg-dark-100 transition-all">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-md hover:bg-brand-600 transition-all flex items-center gap-1.5"><Check size={14}/> Save</button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Actions panel */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-xl hover:bg-brand-50 border border-transparent hover:border-brand-200 text-dark-400 hover:text-brand-600 active:scale-90 transition-all cursor-pointer"
          >
            <Edit2 size={14} />
          </button>

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
