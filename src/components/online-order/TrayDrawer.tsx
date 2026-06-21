import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BundleItem } from '../../types';
import TrayLineItem from './TrayLineItem';
import { X, Send } from 'lucide-react';

interface TrayDrawerProps {
  isOpen: boolean;
  hideOnDesktop?: boolean;
  onClose: () => void;
  cart: BundleItem[];
  menu?: any[];
  onUpdateQty: (cartItemId: string, qty: number) => void;
  onRemove: (cartItemId: string) => void;
  onCheckout: () => void;
  onQuickAdd?: (item: any) => void;
}

export default function TrayDrawer({ isOpen, hideOnDesktop, onClose, cart, menu, onUpdateQty, onRemove, onCheckout, onQuickAdd }: TrayDrawerProps) {
  const total = cart.reduce((sum, item) => sum + (item.bundleTotal * item.quantity), 0);

  const content = (
    <>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-[2rem] sm:rounded-none">
        <div>
          <h2 className="text-xl font-black text-[#431407]">Your Tray</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{cart.length} Items</p>
        </div>
        <button onClick={onClose} className="xl:hidden p-2 bg-gray-100 rounded-full text-gray-500 hover:text-[#431407]">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.length === 0 ? (
          <div 
            className="text-center py-12 px-6 flex flex-col items-center justify-center my-auto cursor-pointer" 
            onClick={onClose}
          >
            <img 
              src="/empty_cart_toy.png" 
              alt="Cute Chef Mascot" 
              className="w-48 h-48 object-contain mb-4 animate-bounce-sm hover:scale-110 transition-transform duration-500" 
            />
            <h3 className="font-black text-gray-800 text-lg uppercase tracking-wider mb-2">Your Tray is Empty</h3>
            <div className="bg-[#fffbeb] border border-[#d97706]/20 rounded-2xl p-4 max-w-[300px] mb-6 shadow-sm select-none">
              <p className="text-[#431407] text-xs font-black leading-relaxed italic text-center">
                "Mmm... smells delicious out there! Tap here or browse our menu to add your favorite hot meals to your plate."
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-[#d97706] to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all select-none"
            >
              Add Items to Tray
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <TrayLineItem 
                key={item.cartItemId} 
                item={item} 
                onUpdateQty={onUpdateQty} 
                onRemove={onRemove} 
              />
            ))}
            
            {/* Frequently Bought Together */}
            {menu && menu.filter(m => m.available && m.category !== 'main' && !cart.some(c => c.menuItemId === m.id)).length > 0 && (
              <div className="bg-white border border-gray-100 p-4 rounded-[1.5rem] shadow-sm space-y-3 mt-6">
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none border-b border-gray-50 pb-2">Frequently Bought Together</h3>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                  {menu.filter(m => m.available && m.category !== 'main' && !cart.some(c => c.menuItemId === m.id)).slice(0, 4).map(m => (
                    <div key={m.id} className="flex-shrink-0 w-28 bg-gray-50 rounded-xl p-2 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                       {m.imageUrl ? (
                         <img src={m.imageUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover mb-1.5 shadow-sm border-2 border-white"/>
                       ) : (
                         <div className="w-10 h-10 rounded-full bg-white mb-1.5 shadow-sm border-2 border-white flex items-center justify-center text-lg">🍲</div>
                       )}
                       <h4 className="text-[9px] font-black text-gray-900 leading-tight mb-0.5 truncate w-full">{m.name}</h4>
                       <span className="text-[9px] font-bold text-[#d97706] mb-1.5">¢{m.hasSizes ? (m.prices.S || m.prices.M) : m.prices.fixed}</span>
                       <button onClick={() => onQuickAdd && onQuickAdd(m)} className="w-full py-1 bg-white border border-gray-200 rounded-lg text-[8px] font-black uppercase tracking-wider text-gray-750 hover:bg-[#d97706] hover:text-white hover:border-[#d97706] transition-colors">Add</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] mt-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-black uppercase text-gray-500 tracking-widest">Total Amount</span>
          <span className="text-3xl font-black text-gray-900">GH₵{total.toFixed(2)}</span>
        </div>
        <button 
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white text-sm font-black tracking-wider uppercase transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none bg-[#d97706] hover:bg-[#b45309]"
        >
          Checkout Securely
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile & Tablet Drawer */}
      <div className="xl:hidden">
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                onClick={onClose}
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-md bg-amber-50 rounded-t-[2rem] sm:rounded-none z-50 flex flex-col shadow-2xl h-[85vh] sm:h-full"
              >
                {content}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Permanent Sidebar */}
      {!hideOnDesktop && (
        <div className="hidden xl:flex sticky top-[72px] h-[calc(100vh-72px)] w-full flex-col">
          {content}
        </div>
      )}
    </>
  );
}
