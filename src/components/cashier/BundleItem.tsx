// components/cashier/BundleItem.tsx
import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { BundleItem as BundleItemType, AddOn } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface Props {
  bundle: BundleItemType;
}

export default function BundleItem({ bundle }: Props) {
  const { state, dispatch } = useAppContext();

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_BUNDLE', payload: bundle.cartItemId });
  };

  const handleIncrement = () => {
    dispatch({ type: 'INCREMENT_BUNDLE_QTY', payload: bundle.cartItemId });
  };

  const handleDecrement = () => {
    if (bundle.quantity > 1) {
      dispatch({ type: 'DECREMENT_BUNDLE_QTY', payload: bundle.cartItemId });
    } else {
      handleRemove();
    }
  };

  const handleEdit = () => {
    dispatch({
      type: 'START_BUNDLE',
      payload: {
        menuItemId:  bundle.menuItemId,
        size:        bundle.size,
        customPrice: bundle.basePrice,
        cartItemId:  bundle.cartItemId,
      },
    });
  };

  // Group duplicate addons for clean visual display
  const groupedAddons = bundle.addons.reduce((acc, curr) => {
    const existing = acc.find(x => x.menuItemId === curr.menuItemId);
    if (existing) {
      existing.quantity += 1;
      existing.totalPrice += curr.price;
    } else {
      acc.push({ ...curr, quantity: 1, totalPrice: curr.price });
    }
    return acc;
  }, [] as Array<AddOn & { quantity: number; totalPrice: number }>);

  const totalBundlePrice = bundle.bundleTotal * bundle.quantity;
  const mainItem = [...state.menu, ...state.addons].find(m => m.id === bundle.menuItemId);
  const showSize = mainItem?.hasSizes ?? true;

  return (
    <div className="bg-white rounded-xl p-3.5 shadow-card border border-brand-50 flex flex-col gap-1.5 animate-fade-in select-none">
      {/* First line: Main dish name + size and base price */}
      <div className="flex justify-between items-start text-sm font-semibold text-dark-900 gap-2">
        <button
          type="button"
          onClick={handleEdit}
          className="flex flex-col items-start text-left hover:text-brand-600 transition-colors cursor-pointer group select-none"
        >
          <span className="font-extrabold flex items-center gap-1.5">
            {bundle.name}{showSize ? ` (${bundle.size})` : ''}
            <span className="text-[10px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-md opacity-80 group-hover:opacity-100 group-hover:bg-brand-100 transition-all">
              Edit
            </span>
          </span>
          <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider mt-0.5">Base: ¢{bundle.basePrice} each</span>
        </button>
        <span className="text-dark-700 font-extrabold">¢{totalBundlePrice.toFixed(2)}</span>
      </div>

      {/* Horizontal Add-ons list to save space */}
      {groupedAddons.length > 0 && (
        <div className="text-xs text-dark-500 my-1 bg-dark-50/50 p-2 rounded-lg border border-dark-100/30 flex flex-wrap gap-x-2 gap-y-0.5 leading-snug">
          <span className="font-extrabold text-dark-700">Add-ons:</span>
          {groupedAddons.map((addon, index) => {
            const qtyPerPack = addon.quantity;
            const totalQty = qtyPerPack * bundle.quantity;
            const addonLabel = bundle.quantity > 1
              ? `${qtyPerPack} per pack · ${totalQty} total`
              : qtyPerPack > 1 ? `x${qtyPerPack}` : '';
              
            return (
              <span key={addon.menuItemId} className="font-semibold text-dark-600">
                +{addon.name}{addonLabel ? ` (${addonLabel})` : ''} (¢{(addon.totalPrice * bundle.quantity).toFixed(2)})
                {index < groupedAddons.length - 1 ? ',' : ''}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer line: subtotal details and remove button + quantity adjustment */}
      <div className="flex justify-between items-center pt-2 mt-1 border-t border-dark-100/30">
        <button
          type="button"
          onClick={handleRemove}
          className="p-1.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all select-none"
        >
          <Trash2 size={16} />
        </button>
        
        {/* Quantity stepper inside cart */}
        <div className="flex items-center gap-2 bg-brand-50 border border-brand-200/50 rounded-xl p-0.5">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-6 h-6 flex items-center justify-center bg-white hover:bg-brand-50 border border-brand-200/60 text-brand-600 rounded-lg font-bold transition-all active:scale-90 select-none"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>
          
          <input
            type="number"
            min="1"
            value={bundle.quantity === 0 ? '' : bundle.quantity}
            onChange={(e) => {
              if (e.target.value === '') {
                dispatch({
                  type: 'UPDATE_BUNDLE_QTY',
                  payload: { cartItemId: bundle.cartItemId, quantity: 0 }
                });
              } else {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) {
                  dispatch({
                    type: 'UPDATE_BUNDLE_QTY',
                    payload: { cartItemId: bundle.cartItemId, quantity: val }
                  });
                }
              }
            }}
            onBlur={() => {
              if (bundle.quantity <= 0) {
                handleRemove();
              }
            }}
            className="font-extrabold text-brand-800 text-xs w-10 text-center select-all bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          
          <button
            type="button"
            onClick={handleIncrement}
            className="w-6 h-6 flex items-center justify-center bg-white hover:bg-brand-50 border border-brand-200/60 text-brand-600 rounded-lg font-bold transition-all active:scale-90 select-none"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
