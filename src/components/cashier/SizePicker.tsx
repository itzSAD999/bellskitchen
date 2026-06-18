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
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-3xl font-black text-brand-900 italic tracking-tight uppercase">{item.name}</h3>
            <p className="text-dark-500 text-sm mt-1 font-semibold">Select a size and configure options</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-50 text-dark-400 active:scale-95 transition-all bg-dark-50 shadow-sm border border-dark-100">
            <X size={20} />
          </button>
        </div>

        {/* Size options */}
        <div className="flex gap-4 justify-center mb-6">
          {sizes.map(size => {
            const isCurrent = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`
                  flex flex-col items-center gap-2 p-6 rounded-[2rem] border-[3px] transition-all duration-300 flex-1 hover:-translate-y-1 active:translate-y-0
                  ${isCurrent
                    ? 'bg-brand-50 border-brand-500 shadow-[0_10px_20px_rgba(217,119,6,0.15)]'
                    : 'bg-white border-dark-100/50 hover:border-brand-300 hover:shadow-lg'
                  }
                `}
              >
                <span className={`text-4xl font-black ${isCurrent ? 'text-brand-600' : 'text-dark-800'}`}>{size}</span>
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isCurrent ? 'text-brand-700' : 'text-dark-400'}`}>{SIZE_LABELS[size]}</span>
                <span className={`font-black text-xl mt-1 ${isCurrent ? 'text-brand-500' : 'text-dark-600'}`}>¢{item.prices[size]}</span>
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
