import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMenu } from '../hooks/useMenu';
import { useOrders } from '../hooks/useOrders';
import MenuGrid from '../components/cashier/MenuGrid';

import AddonSheet from '../components/cashier/AddonSheet';
import CartPanel from '../components/cashier/CartPanel';
import ReceiptView from '../components/receipt/ReceiptView';
import OnlineOrdersModal from '../components/cashier/OnlineOrdersModal';
import { MenuItem } from '../types';

export default function CashierScreen() {
  useMenu();
  useOrders();

  const { state, dispatch } = useApp();
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);

  // Filter for unprinted online orders
  const unprintedOnlineOrders = state.orders.filter(o => o.source === 'online' && !o.printed);

  const handleMenuCardTap = (item: MenuItem, size: 'S' | 'M' | 'L', customPrice?: number) => {
    dispatch({
      type: 'START_BUNDLE',
      payload: {
        menuItemId:  item.id,
        size,
        customPrice: customPrice || item.prices.fixed,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Menu grid + Cart */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative print:hidden">
        {/* Menu Grid - Scrollable, taking remaining space */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-5 pb-1 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-[#431407] tracking-tight leading-none uppercase">Main Menu</h2>
              <p className="text-dark-500 text-xs mt-1.5 font-bold">Tap a dish to configure size and add-ons</p>
            </div>
            
            <button 
              onClick={() => setIsOnlineModalOpen(true)}
              className="relative bg-white border border-[#d97706]/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#431407] shadow-sm hover:bg-amber-50 hover:border-[#d97706]/60 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>📱 Web Orders</span>
              {unprintedOnlineOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-[10px] px-1.5 shadow-md ring-2 ring-white animate-bounce-sm">
                  {unprintedOnlineOrders.length}
                </span>
              )}
            </button>
          </div>
          <MenuGrid onSelect={handleMenuCardTap} />
        </div>
        
        {/* Desktop Sidebar Cart - Fixed width, always expanded, visible only on lg+ screens */}
        <div className="hidden lg:block w-80 xl:w-96 border-l border-dark-100/50 bg-white h-full overflow-hidden flex-shrink-0">
          <CartPanel forceExpanded={true} />
        </div>

        {/* Mobile/Tablet Docked Cart - Collapsible, visible on screens smaller than lg */}
        <div className="lg:hidden">
          <CartPanel />
        </div>
      </div>

      {/* Online Orders Modal */}
      <OnlineOrdersModal 
        isOpen={isOnlineModalOpen} 
        onClose={() => setIsOnlineModalOpen(false)} 
        orders={unprintedOnlineOrders} 
      />

      {/* Addon Sheet — driven by state.pendingBundle (set by START_BUNDLE reducer) */}
      {state.pendingBundle && <AddonSheet />}

      {/* Hidden print-only receipt view. Will be captured by window.print() but not visible in UI */}
      <div className="hidden print:block">
        {state.currentOrder && <ReceiptView order={state.currentOrder} />}
      </div>
    </div>
  );
}
