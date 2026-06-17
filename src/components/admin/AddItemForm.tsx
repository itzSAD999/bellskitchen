// components/admin/AddItemForm.tsx
import React, { useState } from 'react';
import { Plus, X, Utensils, PlusCircle } from 'lucide-react';
import { MenuItem } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

interface Props {
  onDone: () => void;
}

export default function AddItemForm({ onDone }: Props) {
  const { dispatch } = useAppContext();
  const [name, setName]         = useState('');
  const [category, setCategory] = useState<'main' | 'addon'>('main');
  const [hasSizes, setHasSizes] = useState(true);
  const [priceS, setPriceS]     = useState('');
  const [priceM, setPriceM]     = useState('');
  const [priceL, setPriceL]     = useState('');
  const [priceFixed, setPriceFixed] = useState('');
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
      id:        crypto.randomUUID(),
      name:      name.trim(),
      category,
      hasSizes:  category === 'main' ? hasSizes : false,
      prices: hasSizes && category === 'main'
        ? { S: Number(priceS) || 0, M: Number(priceM) || 0, L: Number(priceL) || 0 }
        : { fixed: Number(priceFixed) || 0 },
      available: true,
      sortOrder: 99,
    };

    try {
      const insertPayload: Record<string, unknown> = {
        name:       newItem.name,
        category:   newItem.category,
        has_sizes:  newItem.hasSizes,
        available:  true,
        sort_order: 99,
        ...(newItem.hasSizes
          ? { price_s: newItem.prices.S, price_m: newItem.prices.M, price_l: newItem.prices.L }
          : { price_fixed: newItem.prices.fixed }
        ),
      };

      const { data } = await supabase.from('menu_items').insert(insertPayload).select().single();
      if (data) newItem.id = data.id;
    } catch { /* store locally anyway */ }

    dispatch({ type: 'ADD_MENU_ITEM', payload: newItem });
    onDone();
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-brand-100 flex flex-col gap-4 animate-scale-in select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-100/40">
        <h3 className="font-extrabold text-dark-950 text-base">Add New Item</h3>
        <button
          onClick={onDone}
          className="p-1.5 rounded-xl hover:bg-brand-50 text-dark-400 hover:text-dark-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name input */}
        <div>
          <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block mb-1.5">Item Name</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Waakye Special"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div>
          <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block mb-1.5">Category</label>
          <div className="flex gap-2 bg-dark-50 p-1 rounded-2xl border border-dark-100/60 shadow-inner">
            {(['main', 'addon'] as const).map(cat => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex-grow py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-sm'
                      : 'text-dark-500 hover:text-dark-800'
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
            <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block mb-1.5">Pricing Options</label>
            <div className="flex gap-2 bg-dark-50 p-1 rounded-2xl border border-dark-100/60 shadow-inner">
              <button
                type="button"
                onClick={() => setHasSizes(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  hasSizes ? 'bg-white text-brand-600 shadow-sm border border-brand-100' : 'text-dark-500 hover:text-dark-800'
                }`}
              >
                S / M / L Sizes
              </button>
              <button
                type="button"
                onClick={() => setHasSizes(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  !hasSizes ? 'bg-white text-brand-600 shadow-sm border border-brand-100' : 'text-dark-500 hover:text-dark-800'
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
            <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block mb-1.5">Sizes Pricing (¢)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Small (S)', val: priceS, setter: setPriceS },
                { label: 'Medium (M)', val: priceM, setter: setPriceM },
                { label: 'Large (L)', val: priceL, setter: setPriceL }
              ].map(({ label, val, setter }) => (
                <div key={label} className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-extrabold text-dark-400">¢</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder={label.split(' ')[0]}
                    value={val}
                    onChange={e => setter(e.target.value)}
                    className="input pl-7 text-center font-bold text-brand-600 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block mb-1.5">Price (¢)</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xs font-extrabold text-dark-400">¢</span>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 15.00"
                value={priceFixed}
                onChange={e => setPriceFixed(e.target.value)}
                className="input pl-8 font-bold text-brand-600 text-sm"
              />
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-2"
        >
          <Plus size={16} />
          {saving ? 'Saving Item…' : 'Add Item'}
        </button>
      </form>
    </div>
  );
}
