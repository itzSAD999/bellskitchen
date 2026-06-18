// components/admin/AddItemForm.tsx
import React, { useState } from 'react';
import { Plus, X, Utensils, PlusCircle } from 'lucide-react';
import { MenuItem } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

interface Props {
  onDone: () => void;
  docked?: boolean;
}

const PRESETS = [
  {
    name: 'Jollof Rice',
    category: 'main' as const,
    hasSizes: true,
    prices: { S: 35, M: 40, L: 45 },
    description: 'Rich, spicy Ghanaian Jollof rice cooked in a savory, aromatic tomato and pepper stew. Served hot.',
    imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fried Rice',
    category: 'main' as const,
    hasSizes: true,
    prices: { S: 35, M: 40, L: 45 },
    description: 'Stir-fried jasmine rice with colorful spring veggies, aromatic spices, and green onions.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Banku & Tilapia',
    category: 'main' as const,
    hasSizes: true,
    prices: { S: 60, M: 65, L: 70 },
    description: 'Hot fermented corn and cassava dough (Banku) served with a perfectly grilled, seasoned whole tilapia, shito, and fresh salsa.',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Kokoo (Plantain)',
    category: 'addon' as const,
    hasSizes: false,
    prices: { fixed: 1 },
    description: 'Sweet, golden-brown fried ripe plantains. A classic West African side.',
    imageUrl: 'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Big Sausage',
    category: 'addon' as const,
    hasSizes: false,
    prices: { fixed: 7 },
    description: 'Juicy, grilled premium beef sausage.',
    imageUrl: 'https://images.unsplash.com/photo-1541248421061-ee27e85c2c5c?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Extra Chicken',
    category: 'addon' as const,
    hasSizes: false,
    prices: { fixed: 15 },
    description: 'Crispy, deep-fried spiced chicken thigh.',
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Boiled Egg',
    category: 'addon' as const,
    hasSizes: false,
    prices: { fixed: 3 },
    description: 'Perfectly hard-boiled fresh egg.',
    imageUrl: 'https://images.unsplash.com/photo-1582722418905-243727f94d49?w=600&auto=format&fit=crop&q=80',
  }
];

export default function AddItemForm({ onDone, docked = false }: Props) {
  const { dispatch } = useAppContext();
  const [name, setName]         = useState('');
  const [category, setCategory] = useState<'main' | 'addon'>('main');
  const [hasSizes, setHasSizes] = useState(true);
  const [priceS, setPriceS]     = useState('');
  const [priceM, setPriceM]     = useState('');
  const [priceL, setPriceL]     = useState('');
  const [priceFixed, setPriceFixed] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleCategoryChange = (cat: 'main' | 'addon') => {
    setCategory(cat);
    setHasSizes(cat === 'main');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }

    setSaving(true);
    setError(null);

    const newItem: MenuItem = {
      id:          crypto.randomUUID(),
      name:        name.trim(),
      category,
      hasSizes:    category === 'main' ? hasSizes : false,
      prices: hasSizes && category === 'main'
        ? { S: Number(priceS) || 0, M: Number(priceM) || 0, L: Number(priceL) || 0 }
        : { fixed: Number(priceFixed) || 0 },
      description: description.trim() || undefined,
      imageUrl:    imageUrl.trim() || undefined,
      available:   true,
      sortOrder:   99,
    };

    try {
      const insertPayload: Record<string, unknown> = {
        name:        newItem.name,
        category:    newItem.category,
        has_sizes:   newItem.hasSizes,
        available:   true,
        sort_order:  99,
        description: newItem.description || null,
        image_url:   newItem.imageUrl || null,
        ...(newItem.hasSizes
          ? { price_s: newItem.prices.S, price_m: newItem.prices.M, price_l: newItem.prices.L }
          : { price_fixed: newItem.prices.fixed }
        ),
      };

      const { data } = await supabase.from('menu_items').insert(insertPayload).select().single();
      if (data) newItem.id = data.id;
    } catch { /* store locally anyway */ }

    dispatch({ type: 'ADD_MENU_ITEM', payload: newItem });
    setName('');
    setDescription('');
    setImageUrl('');
    setPriceS('');
    setPriceM('');
    setPriceL('');
    setPriceFixed('');
    
    if (!docked) {
      onDone();
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_15px_40px_rgba(67,20,7,0.08)] border border-[#d97706]/15 flex flex-col gap-4 animate-scale-in select-none max-h-[90vh] overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-150/60">
        <h3 className="font-black text-[#431407] text-base uppercase tracking-wider">Add New Item</h3>
        {!docked && (
          <button
            type="button"
            onClick={onDone}
            className="p-1.5 rounded-xl hover:bg-[#fff8ed] text-gray-400 hover:text-[#d97706] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Quick Presets Gallery */}
      <div>
        <label className="text-[10px] font-black text-[#431407] opacity-60 uppercase tracking-widest block mb-2">
          ⚡ Quick Presets
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin hide-scrollbar scroll-smooth">
          {PRESETS.map((p) => {
            const isSelected = name === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setName(p.name);
                  setCategory(p.category);
                  setHasSizes(p.hasSizes);
                  if (p.hasSizes) {
                    const pricesObj = p.prices as { S: number; M: number; L: number };
                    setPriceS(pricesObj.S.toString());
                    setPriceM(pricesObj.M.toString());
                    setPriceL(pricesObj.L.toString());
                    setPriceFixed('');
                  } else {
                    const pricesObj = p.prices as { fixed: number };
                    setPriceFixed(pricesObj.fixed.toString());
                    setPriceS('');
                    setPriceM('');
                    setPriceL('');
                  }
                  setDescription(p.description);
                  setImageUrl(p.imageUrl);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isSelected
                    ? 'bg-[#d97706] border-[#d97706] text-white'
                    : 'bg-[#fff8ed]/60 border-[#d97706]/15 text-[#431407] hover:bg-[#fff8ed] hover:border-[#d97706]/30'
                }`}
              >
                {p.name.includes('Jollof') ? '🌶️ ' : p.name.includes('Fried') ? '🍚 ' : p.name.includes('Banku') ? '🐟 ' : p.name.includes('Plantain') ? '🍌 ' : p.name.includes('Sausage') ? '🌭 ' : p.name.includes('Chicken') ? '🍗 ' : '🥚 '}
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name input */}
        <div>
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Item Name</label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner"
            placeholder="e.g. Waakye Special"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div>
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Category</label>
          <div className="flex gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200 shadow-inner">
            {(['main', 'addon'] as const).map(cat => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex-grow py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#d97706] text-white shadow-md'
                      : 'text-gray-500 hover:text-[#431407]'
                  }`}
                >
                  {cat === 'main' ? <Utensils size={13} /> : <PlusCircle size={13} />}
                  {cat === 'main' ? 'Main' : 'Add-on'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Layout Toggle (Only for Mains) */}
        {category === 'main' && (
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Pricing Options</label>
            <div className="flex gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200 shadow-inner">
              <button
                type="button"
                onClick={() => setHasSizes(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  hasSizes ? 'bg-white text-[#d97706] shadow-sm border border-[#d97706]/20' : 'text-gray-500 hover:text-[#431407]'
                }`}
              >
                S / M / L Sizes
              </button>
              <button
                type="button"
                onClick={() => setHasSizes(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  !hasSizes ? 'bg-white text-[#d97706] shadow-sm border border-[#d97706]/20' : 'text-gray-500 hover:text-[#431407]'
                }`}
              >
                Fixed Price
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Pricing Inputs */}
        {hasSizes && category === 'main' ? (
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Sizes Pricing (¢)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Small (S)', val: priceS, setter: setPriceS },
                { label: 'Medium (M)', val: priceM, setter: setPriceM },
                { label: 'Large (L)', val: priceL, setter: setPriceL }
              ].map(({ label, val, setter }) => (
                <div key={label} className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-black text-gray-400">¢</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder={label.split(' ')[0]}
                    value={val}
                    onChange={e => setter(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl pl-6 pr-2 py-2 text-center font-black text-[#d97706] text-xs transition-all shadow-inner"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Price (¢)</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xs font-black text-gray-400">¢</span>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 15.00"
                value={priceFixed}
                onChange={e => setPriceFixed(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl pl-8 pr-3 py-2.5 text-xs font-black text-[#d97706] transition-all shadow-inner"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Description</label>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all h-14 resize-none shadow-inner"
            placeholder="Describe the meal ingredients..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Image URL with Preview */}
        <div>
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Image URL</label>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner"
            placeholder="e.g. https://images.unsplash.com/..."
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
        </div>

        {/* Live Menu Preview Card Mockup */}
        <div className="mt-2 pt-4 border-t border-gray-150/60 flex flex-col gap-2">
          <span className="text-[10px] font-black text-[#431407] opacity-60 uppercase tracking-widest block">
            ✨ Customer Card Live Preview
          </span>
          <div className="bg-[#fffbeb]/40 rounded-2xl p-3 border border-[#d97706]/15 shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#431407]/5 border border-gray-200 relative mb-2.5">
              {imageUrl.trim() ? (
                <img
                  src={imageUrl.trim()}
                  alt={name || "Preview"}
                  className="w-full h-full object-cover transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Utensils className="opacity-30" size={20} />
                </div>
              )}
              <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest bg-[#d97706] text-white px-2.5 py-0.5 rounded-full border border-white/10 shadow-sm">
                {category}
              </span>
            </div>
            <div>
              <h4 className="font-black text-[#431407] text-xs truncate uppercase tracking-wider">
                {name || 'Unnamed Dish'}
              </h4>
              <p className="text-[10px] text-gray-500 font-semibold line-clamp-2 mt-1 leading-normal">
                {description || 'Provide ingredients, spices, and details.'}
              </p>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-150/40">
                <span className="text-xs font-black text-[#d97706]">
                  {category === 'main' && hasSizes ? (
                    `¢${priceS || '0'} - ¢${priceL || '0'}`
                  ) : (
                    `¢${priceFixed || '0'}`
                  )}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest bg-[#431407] text-[#ffefd4] px-2.5 py-1.5 rounded-xl border border-[#d97706]/20 shadow-xs">
                  Customize +
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-black uppercase tracking-wider">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-[#431407] hover:bg-[#2a0e05] disabled:bg-gray-200 text-[#ffefd4] disabled:text-gray-400 font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-md active:scale-95 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2 mt-1 border border-[#d97706]/20"
        >
          <Plus size={14} strokeWidth={3} />
          {saving ? 'Saving Item…' : 'Add Item'}
        </button>
      </form>
    </div>
  );
}
