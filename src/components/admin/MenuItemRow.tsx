// components/admin/MenuItemRow.tsx
import React, { useState } from 'react';
import { 
  Check, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Edit2, 
  Utensils, 
  Flame, 
  Layers, 
  Fish, 
  Sparkles, 
  ChefHat, 
  PlusCircle, 
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
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
  bgClass: 'bg-gradient-to-tr from-[#d97706]/15 to-amber-500/10 border-[#d97706]/20',
  textClass: 'text-[#d97706]',
};

interface Props {
  item: MenuItem;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function MenuItemRow({ item, onMoveUp, onMoveDown }: Props) {
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
      <div className="bg-white rounded-3xl p-5 border border-[#d97706]/40 shadow-lg transition-all duration-200 select-none animate-scale-in">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-150/60">
            <h3 className="text-sm font-black text-[#431407] uppercase tracking-wider">Edit Menu Item</h3>
            <button type="button" onClick={handleDelete} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer border border-red-200/55" title="Delete Item">
              <Trash2 size={15} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as 'main' | 'addon' })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none transition-all shadow-inner">
                <option value="main">Main</option>
                <option value="addon">Add-on</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all h-16 resize-none shadow-inner" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Image URL</label>
            <div className="flex gap-2 items-center">
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="flex-1 w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner" />
              {formData.imageUrl.trim().startsWith('http') && (
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#d97706]/35 flex-shrink-0 shadow-inner bg-gray-100">
                  <img src={formData.imageUrl.trim()} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Prices (¢)</label>
            <div className="flex gap-2 flex-wrap">
              {item.hasSizes ? (
                (['S', 'M', 'L'] as const).map(s => (
                  <div key={s} className="relative flex items-center">
                    <span className="absolute left-3 text-[10px] font-black text-gray-400 uppercase select-none">{s}</span>
                    <input type="number" value={prices[s] ?? ''} onChange={e => setPrices(p => ({ ...p, [s]: Number(e.target.value) }))} className="w-20 bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl pl-6 pr-2 py-2 text-center font-bold text-[#d97706] text-xs transition-all shadow-inner" placeholder={s} />
                  </div>
                ))
              ) : (
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-black text-gray-400 select-none">¢</span>
                  <input type="number" value={prices.fixed ?? ''} onChange={e => setPrices(p => ({ ...p, fixed: Number(e.target.value) }))} className="w-24 bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl pl-6 pr-2 py-2 font-bold text-[#d97706] text-xs transition-all shadow-inner" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-150/60">
            <button type="button" onClick={() => { setEditing(false); setPrices(item.prices); setFormData({name: item.name, category: item.category, description: item.description||'', imageUrl: item.imageUrl||''}); }} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all select-none">Cancel</button>
            <button type="button" onClick={handleSave} className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-[#431407] hover:bg-[#2a0e05] text-[#ffefd4] shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 select-none"><Check size={14} strokeWidth={3}/> Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl p-4 border transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.02)] select-none ${
      item.available 
        ? 'border-gray-200/80 hover:border-[#d97706]/40 hover:shadow-[0_12px_25px_rgba(67,20,7,0.06)] hover:scale-[1.01]' 
        : 'border-red-100 bg-red-50/5 opacity-85'
    }`}>
      <div className="flex items-center gap-3">
        {/* Reordering Controls (Vertical arrows) */}
        <div className="flex flex-col items-center justify-center gap-1.5 border-r border-gray-150/50 pr-3 mr-1 flex-shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className={`p-1 rounded-lg transition-all ${
              onMoveUp 
                ? 'text-gray-400 hover:text-[#d97706] hover:bg-[#fff8ed] active:scale-90 cursor-pointer' 
                : 'text-gray-200 cursor-not-allowed'
            }`}
            title="Move Up"
          >
            <ChevronUp size={15} strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className={`p-1 rounded-lg transition-all ${
              onMoveDown 
                ? 'text-gray-400 hover:text-[#d97706] hover:bg-[#fff8ed] active:scale-90 cursor-pointer' 
                : 'text-gray-200 cursor-not-allowed'
            }`}
            title="Move Down"
          >
            <ChevronDown size={15} strokeWidth={3} />
          </button>
        </div>

        {/* Visual Badge wrapper for image or vector Icon */}
        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#d97706]/15 flex-shrink-0 transition-all shadow-inner bg-gray-50">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${item.available ? theme.bgClass : 'bg-gray-100'}`}>
              <IconComponent size={18} className={item.available ? theme.textClass : 'text-gray-400'} />
            </div>
          )}
        </div>

        {/* Name + description / category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-[#431407] text-sm truncate leading-tight select-none">
              {item.name}
            </p>
            {!item.available && (
              <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
                Sold Out
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5 select-none">
            {item.description || 'No description provided.'}
          </p>
        </div>

        {/* Prices area */}
        <div className="flex-shrink-0 pr-2">
          {item.hasSizes ? (
            <div className="flex gap-1 text-[9px] font-black text-gray-600 select-none">
              <span className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-200/60">S: ¢{item.prices.S}</span>
              <span className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-200/60">M: ¢{item.prices.M}</span>
              <span className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-200/60">L: ¢{item.prices.L}</span>
            </div>
          ) : (
            <span className="bg-[#fff8ed] text-[#d97706] px-2.5 py-1.5 rounded-lg border border-[#d97706]/20 text-xs font-black select-none">
              ¢{item.prices.fixed}
            </span>
          )}
        </div>

        {/* Actions panel */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-xl hover:bg-[#fff8ed] border border-transparent hover:border-[#d97706]/20 text-gray-400 hover:text-[#d97706] active:scale-90 transition-all cursor-pointer"
            title="Edit Item"
          >
            <Edit2 size={13} />
          </button>

          <button
            onClick={handleToggleAvailable}
            className="p-0.5 active:scale-90 transition-all cursor-pointer"
            title={item.available ? "Mark Sold Out" : "Mark Available"}
          >
            {item.available ? (
              <ToggleRight size={28} className="text-[#d97706]" strokeWidth={1.5} />
            ) : (
              <ToggleLeft size={28} className="text-gray-300" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
