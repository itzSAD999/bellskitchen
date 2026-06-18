// components/cashier/AddonSheet.tsx
//
// Reads main + size from state.pendingBundle (set by START_BUNDLE).
// Dispatches CONFIRM_BUNDLE — the reducer generates cartItemId.
// Dispatches DISMISS_PENDING_BUNDLE (via CANCEL_PENDING) on close.

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { AddOn } from '../../types';
import { useApp } from '../../context/AppContext';
import AddonItem from './AddonItem';

// No props — all data comes from state.pendingBundle.
export default function AddonSheet() {
  const { state, dispatch } = useApp();
  // Map from addon ID to its selected quantity
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  // Quantity of the entire bundle (e.g. 10 plates of Fried Rice)
  const [bundleQuantity, setBundleQuantity] = useState(1);

  const pending = state.pendingBundle;

  useEffect(() => {
    if (pending && pending.cartItemId) {
      const existing = state.cart.find(b => b.cartItemId === pending.cartItemId);
      if (existing) {
        const qtyMap: Record<string, number> = {};
        existing.addons.forEach(addon => {
          qtyMap[addon.menuItemId] = (qtyMap[addon.menuItemId] ?? 0) + 1;
        });
        setAddonQuantities(qtyMap);
        setBundleQuantity(existing.quantity);
      }
    } else {
      setAddonQuantities({});
      setBundleQuantity(1);
    }
  }, [pending?.cartItemId, state.cart]);

  if (!pending) return null;

  // Look up the MenuItem from state.menu
  const main = [...state.menu, ...state.addons].find(m => m.id === pending.menuItemId);
  if (!main) return null;

  const { size } = pending;
  const basePrice = pending.customPrice ?? (main.hasSizes ? (main.prices[size] ?? 0) : (main.prices.fixed ?? 0));
  const isEditing = !!pending.cartItemId;

  const handleIncrement = (addonId: string) => {
    setAddonQuantities(prev => ({
      ...prev,
      [addonId]: (prev[addonId] ?? 0) + 1,
    }));
  };

  const handleDecrement = (addonId: string) => {
    setAddonQuantities(prev => {
      const next = { ...prev };
      if ((next[addonId] ?? 0) > 1) {
        next[addonId]--;
      } else {
        delete next[addonId];
      }
      return next;
    });
  };

  const handleDeselect = (addonId: string) => {
    setAddonQuantities(prev => {
      const next = { ...prev };
      delete next[addonId];
      return next;
    });
  };

  const handleSetQuantity = (addonId: string, qty: number) => {
    setAddonQuantities(prev => {
      const next = { ...prev };
      if (qty > 0) {
        next[addonId] = qty;
      } else {
        delete next[addonId];
      }
      return next;
    });
  };

  // Convert the quantity map to an array of AddOn objects containing duplicates
  const selectedAddonList: AddOn[] = state.addons.flatMap(a => {
    const qty = addonQuantities[a.id] ?? 0;
    return Array.from({ length: qty }, () => ({
      menuItemId: a.id,
      name:       a.name,
      price:      a.prices.fixed ?? 0,
    }));
  });

  const bundleTotal = basePrice + selectedAddonList.reduce((sum, item) => sum + item.price, 0);
  const totalAddonsCount = Object.values(addonQuantities).reduce((a, b) => a + b, 0);

  const handleAddToOrder = () => {
    dispatch({
      type: 'CONFIRM_BUNDLE',
      payload: {
        menuItemId:  main.id,
        name:        main.name,
        size,
        basePrice,
        addons:      selectedAddonList,
        bundleTotal,
        quantity:    bundleQuantity,
      },
    });

    // Reset local selection state
    setAddonQuantities({});
    setBundleQuantity(1);
  };

  const handleSkipAddons = () => {
    dispatch({
      type: 'CONFIRM_BUNDLE',
      payload: {
        menuItemId:  main.id,
        name:        main.name,
        size,
        basePrice,
        addons:      [],
        bundleTotal: basePrice,
        quantity:    bundleQuantity,
      },
    });

    setAddonQuantities({});
    setBundleQuantity(1);
  };

  // Close without adding — clear pendingBundle by dispatching a cancel action.
  const handleClose = () => {
    dispatch({ type: 'CANCEL_PENDING' });
    setAddonQuantities({});
    setBundleQuantity(1);
  };

  // Only show available addons from the menu
  const sortedAddons = [...state.addons]
    .filter(a => a.available)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* Backdrop */}
      <div className="sheet-backdrop" onClick={handleClose} />

      {/* Panel */}
      <div className="sheet-panel flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-dark-200 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-dark-950">
              {isEditing ? 'Edit: ' : ''}{main.name} ({size}) — ¢{basePrice}
            </h3>
            <p className="text-dark-500 text-sm mt-0.5">
              {isEditing ? 'Update your customized bundle' : 'Customize your bundle with add-ons'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-brand-50 text-dark-400 active:scale-95 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Addon list */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {sortedAddons.length === 0 ? (
            <p className="text-center text-dark-400 py-8">No add-ons available</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedAddons.map(addon => (
                <AddonItem
                  key={addon.id}
                  addon={addon}
                  quantity={addonQuantities[addon.id] ?? 0}
                  onIncrement={() => handleIncrement(addon.id)}
                  onDecrement={() => handleDecrement(addon.id)}
                  onDeselect={() => handleDeselect(addon.id)}
                  onChangeQuantity={(qty) => handleSetQuantity(addon.id, qty)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer: total + quantity + confirm/skip */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-brand-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-dark-500 text-xs">
                Subtotal ({bundleQuantity} units)
                {totalAddonsCount > 0 && ` · ${totalAddonsCount} add-on${totalAddonsCount !== 1 ? 's' : ''}`}
              </p>
              <p className="text-brand-500 font-black text-2xl">¢{(bundleTotal * bundleQuantity).toFixed(2)}</p>
              {bundleQuantity > 1 && (
                <p className="text-[10px] text-dark-400 font-semibold">¢{bundleTotal.toFixed(2)} each</p>
              )}
            </div>

            {/* Space-saving quantity stepper with direct keyboard entry */}
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setBundleQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center bg-white hover:bg-brand-50 border border-brand-200 text-brand-600 rounded-lg font-bold transition-all active:scale-90 select-none"
              >
                <Minus size={12} strokeWidth={2.5} />
              </button>
              
              <input
                type="number"
                min="1"
                value={bundleQuantity === 0 ? '' : bundleQuantity}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setBundleQuantity(0);
                  } else {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 0) {
                      setBundleQuantity(val);
                    }
                  }
                }}
                onBlur={() => {
                  if (bundleQuantity <= 0) {
                    setBundleQuantity(1);
                  }
                }}
                className="font-extrabold text-brand-800 text-sm w-9 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <button
                type="button"
                onClick={() => setBundleQuantity(q => q + 1)}
                className="w-7 h-7 flex items-center justify-center bg-white hover:bg-brand-50 border border-brand-200 text-brand-600 rounded-lg font-bold transition-all active:scale-90 select-none"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkipAddons}
              className="btn-secondary flex-1 py-3.5 text-sm font-bold"
            >
              {isEditing ? 'Remove Add-ons' : 'Skip Add-ons'}
            </button>
            <button
              type="button"
              onClick={handleAddToOrder}
              className="btn-primary flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              {isEditing ? <Check size={16} /> : <Plus size={16} />}
              {isEditing ? 'Update Order' : 'Add to Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
