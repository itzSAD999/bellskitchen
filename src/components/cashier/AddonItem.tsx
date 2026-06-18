// components/cashier/AddonItem.tsx
import React from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { MenuItem } from '../../types';

interface Props {
  addon:       MenuItem;
  quantity:    number;
  onIncrement: () => void;
  onDecrement: () => void;
  onDeselect:  () => void;
  onChangeQuantity: (qty: number) => void;
}

export default function AddonItem({ addon, quantity, onIncrement, onDecrement, onDeselect, onChangeQuantity }: Props) {
  const isSelected = quantity > 0;
  const fixedPrice = addon.prices.fixed ?? 0;

  return (
    <div
      onClick={() => {
        if (!isSelected) onIncrement();
      }}
      className={`
        flex flex-col justify-between items-center w-full p-3.5 rounded-2xl
        border-2 transition-all duration-150 select-none min-h-[140px]
        ${isSelected
          ? 'bg-brand-50/40 border-brand-400 shadow-sm'
          : 'bg-white border-dark-100 hover:border-brand-200 hover:shadow-sm'
        }
        cursor-pointer group
      `}
    >
      {/* Top row: Check circle + Price */}
      <div className="flex justify-between items-center w-full flex-shrink-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (isSelected) {
              onDeselect();
            } else {
              onIncrement();
            }
          }}
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
            transition-all duration-150 cursor-pointer
            ${isSelected ? 'bg-brand-500 border-brand-500' : 'bg-white border-dark-200 group-hover:border-brand-400'}
          `}
        >
          {isSelected && <Check size={10} className="text-white" strokeWidth={3.5} />}
        </div>
        <span className="text-xs font-extrabold text-brand-600">
          ¢{fixedPrice.toFixed(2)}
        </span>
      </div>

      {/* Middle: Name */}
      <div className="flex-1 flex items-center justify-center my-2 w-full min-w-0">
        <span className={`text-xs font-bold text-center leading-snug break-words ${isSelected ? 'text-brand-900 font-extrabold' : 'text-dark-800'}`}>
          {addon.name}
        </span>
      </div>

      {/* Bottom button or stepper */}
      <div className="w-full flex-shrink-0">
        {isSelected ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between bg-white border border-brand-200 rounded-xl p-0.5 shadow-sm"
          >
            <button
              type="button"
              onClick={onDecrement}
              className="w-6 h-6 flex items-center justify-center bg-brand-50 hover:bg-brand-100 border border-brand-200/50 text-brand-600 rounded-lg active:scale-90 transition-all font-bold"
            >
              <Minus size={10} strokeWidth={3} />
            </button>
            <input
              type="number"
              min="0"
              value={quantity === 0 ? '' : quantity}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  onChangeQuantity(val);
                }
              }}
              className="font-extrabold text-brand-800 text-xs w-7 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={onIncrement}
              className="w-6 h-6 flex items-center justify-center bg-brand-50 hover:bg-brand-100 border border-brand-200/50 text-brand-600 rounded-lg active:scale-90 transition-all font-bold"
            >
              <Plus size={10} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="w-full text-center py-1 text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50/60 border border-brand-100/50 rounded-xl group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-all">
            + Add
          </div>
        )}
      </div>
    </div>
  );
}
