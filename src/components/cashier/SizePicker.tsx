// components/cashier/SizePicker.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MenuItem } from '../../types';

interface Props {
  item:      MenuItem;
  onConfirm: (size: 'S' | 'M' | 'L', customPrice?: number) => void;
  onClose:   () => void;
}

const SIZE_LABELS: Record<'S' | 'M' | 'L', string> = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
};

export default function SizePicker({ item, onConfirm, onClose }: Props) {
  const sizes = (['S', 'M', 'L'] as const).filter(s => item.prices[s] !== undefined);
  
  // Set default selected size to first available
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>(sizes[0] ?? 'M');
  const [customPrice, setCustomPrice] = useState('');

  const handleConfirm = () => {
    const parsed = parseFloat(customPrice);
    const overriddenPrice = !isNaN(parsed) && parsed >= 0 ? parsed : undefined;
    onConfirm(selectedSize, overriddenPrice);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="sheet-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="sheet-panel px-5 py-6 md:max-w-md">
        {/* Handle */}
        <div className="w-10 h-1 bg-dark-200 rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-dark-950">{item.name}</h3>
            <p className="text-dark-400 text-sm mt-0.5">Select a size and configure options</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-brand-50 text-dark-400 active:scale-95 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Size options */}
        <div className="flex gap-4 justify-center mb-5">
          {sizes.map(size => {
            const isCurrent = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`
                  flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-150 flex-1
                  ${isCurrent
                    ? 'bg-brand-50/50 border-brand-400 shadow-sm'
                    : 'bg-white border-dark-100 hover:border-brand-100'
                  }
                `}
              >
                <span className={`text-2xl font-black ${isCurrent ? 'text-brand-700' : 'text-dark-800'}`}>{size}</span>
                <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">{SIZE_LABELS[size]}</span>
                <span className="text-brand-500 font-black text-lg">¢{item.prices[size]}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Price input field */}
        <div className="mt-4 border-t border-dark-100/50 pt-4 px-1">
          <label className="text-xs font-bold text-dark-500 uppercase tracking-widest block mb-2">
            Custom Price (Optional override)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-dark-500 font-extrabold text-lg">¢</span>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder={String(item.prices[selectedSize] ?? '')}
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              className="input pl-8 font-black text-brand-600 text-lg"
            />
          </div>
        </div>

        {/* Primary confirmation action */}
        <button
          type="button"
          onClick={handleConfirm}
          className="btn-primary w-full mt-6 py-4 text-base font-bold shadow-lg"
        >
          Confirm Size
        </button>
      </div>
    </>
  );
}
