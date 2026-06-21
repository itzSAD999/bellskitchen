import React, { useState } from 'react';
import { ShoppingBag, Truck, Store, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface CounterHeaderProps {
  cartItemCount: number;
  onOpenTray: () => void;
  trayIconRef: React.RefObject<HTMLButtonElement>;
  isTrayPulsing: boolean;
}

export default function CounterHeader({ cartItemCount, onOpenTray, trayIconRef, isTrayPulsing }: CounterHeaderProps) {
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');

  return (
    <header className="sticky top-0 z-40 bg-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-8">
        <div className="flex flex-col cursor-pointer" onClick={() => window.location.href = '/'}>
          <span className="text-[#d97706] font-black text-2xl italic tracking-tight leading-none">
            Bells
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer hover:text-[#d97706] transition-colors">
           <MapPin size={18} className="text-[#d97706]"/>
           <span>{method === 'delivery' ? 'Deliver to: Select Address' : 'Pickup from: Main Branch'}</span>
        </div>

        <motion.button 
          ref={trayIconRef}
          onClick={onOpenTray}
          animate={isTrayPulsing ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="relative w-12 h-12 bg-white hover:bg-amber-50 rounded-full flex items-center justify-center text-[#d97706] transition-all shadow-sm border border-[#d97706]/20"
        >
          <ShoppingBag size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d97706] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
              {cartItemCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
}
