import React from 'react';
import { BundleItem } from '../../types';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface TrayLineItemProps {
  item: BundleItem;
  onUpdateQty: (cartItemId: string, newQty: number) => void;
  onRemove: (cartItemId: string) => void;
}

export default function TrayLineItem({ item, onUpdateQty, onRemove }: TrayLineItemProps) {
  return (
    <div className="bg-white rounded-[1.5rem] p-4 border border-gray-100 shadow-sm flex gap-4 transition-all hover:shadow-md animate-scale-in">
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#431407] border border-gray-100 shadow-inner">
        <img 
          src={item.imageUrl || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800"} 
          alt={item.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-black text-gray-900 leading-tight">{item.name}</h4>
            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wide">Size: {item.size}</p>
            {item.addons.length > 0 && (
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5 leading-normal">
                + {item.addons.map(a => a.name).join(', ')}
              </p>
            )}
            {item.instructions && (
              <p className="text-[10px] text-[#d97706] italic font-medium mt-1 leading-normal border-l-2 border-[#d97706]/30 pl-1.5">
                Note: {item.instructions}
              </p>
            )}
          </div>
          <span className="text-sm font-black text-[#d97706] select-none">
            ¢{(item.bundleTotal * item.quantity).toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-50">
          <button 
            onClick={() => onRemove(item.cartItemId)}
            className="text-[10px] text-gray-400 hover:text-red-500 font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
          
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-0.5">
            <button 
              onClick={() => onUpdateQty(item.cartItemId, Math.max(1, item.quantity - 1))}
              className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-800 font-bold shadow-sm hover:bg-gray-100 transition-colors"
            >
              <Minus size={10} />
            </button>
            <span className="text-gray-900 text-xs font-black w-4 text-center">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQty(item.cartItemId, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-800 font-bold shadow-sm hover:bg-gray-100 transition-colors"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
