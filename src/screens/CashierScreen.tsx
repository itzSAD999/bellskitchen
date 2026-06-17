import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMenu } from '../hooks/useMenu';
import { useOrders } from '../hooks/useOrders';
import MenuGrid from '../components/cashier/MenuGrid';
import SizePicker from '../components/cashier/SizePicker';
import AddonSheet from '../components/cashier/AddonSheet';
import CartPanel from '../components/cashier/CartPanel';
import ReceiptView from '../components/receipt/ReceiptView';
import { MenuItem } from '../types';

export default function CashierScreen() {
  useMenu();
  useOrders();

  const { state, dispatch } = useApp();

  // SizePicker needs to know which MenuItem was tapped before we can
  // dispatch START_BUNDLE (which requires both menuItemId AND size).
  const [selectedMain, setSelectedMain]     = useState<MenuItem | null>(null);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const handleMenuCardTap = (item: MenuItem) => {
    if (item.hasSizes) {
      setSelectedMain(item);
      setShowSizePicker(true);
    } else {
      // Skip size selection, trigger add-ons immediately using 'M' and its fixed price
      dispatch({
        type: 'START_BUNDLE',
        payload: {
          menuItemId:  item.id,
          size:        'M',
          customPrice: item.prices.fixed,
        },
      });
    }
  };

  const handleSizeConfirm = (size: 'S' | 'M' | 'L', customPrice?: number) => {
    if (!selectedMain) return;
    // Dispatch START_BUNDLE → sets state.pendingBundle in reducer.
    // AddonSheet renders because pendingBundle is now non-null.
    dispatch({ type: 'START_BUNDLE', payload: { menuItemId: selectedMain.id, size, customPrice } });
    setShowSizePicker(false);
    setSelectedMain(null);
  };

  const handleSizePickerClose = () => {
    setShowSizePicker(false);
    setSelectedMain(null);
  };

  return (
    <div className="flex flex-col h-full bg-brand-50 relative">
      {/* Menu grid + Cart */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative print:hidden">
        {/* Menu Grid - Scrollable, taking remaining space */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4">
            <h2 className="text-[10px] font-black text-brand-600 uppercase tracking-widest leading-none">Main Menu</h2>
            <p className="text-dark-500 text-xs mt-1 font-semibold">Tap a dish to configure size and add-ons</p>
          </div>
          <MenuGrid onSelect={handleMenuCardTap} />
        </div>
        
        {/* Desktop Sidebar Cart - Fixed width, always expanded, visible only on md+ screens */}
        <div className="hidden md:block w-96 border-l border-dark-100/50 bg-white h-full overflow-hidden flex-shrink-0">
          <CartPanel forceExpanded={true} />
        </div>

        {/* Mobile Docked Cart - Collapsible, visible only on screens smaller than md */}
        <div className="md:hidden">
          <CartPanel />
        </div>
      </div>

      {/* Size Picker — shown before START_BUNDLE is dispatched */}
      {showSizePicker && selectedMain && (
        <SizePicker
          item={selectedMain}
          onConfirm={handleSizeConfirm}
          onClose={handleSizePickerClose}
        />
      )}

      {/* Addon Sheet — driven by state.pendingBundle (set by START_BUNDLE reducer) */}
      {state.pendingBundle && <AddonSheet />}

      {/* Hidden print-only receipt view. Will be captured by window.print() but not visible in UI */}
      <div className="hidden print:block">
        {state.currentOrder && <ReceiptView order={state.currentOrder} />}
      </div>
    </div>
  );
}
