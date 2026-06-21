import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, AddOn } from '../../types';
import { Check, Plus, Minus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BundleBuilderProps {
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (item: MenuItem, size: 'S' | 'M' | 'L', addons: AddOn[], instructions: string, qty: number, btnRect: DOMRect) => void;
}

export default function BundleBuilder({ item, onClose, onConfirm }: BundleBuilderProps) {
  const { state } = useApp();
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [qty, setQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [instructions, setInstructions] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);

  // Set default size if M is not available but S is, etc.
  React.useEffect(() => {
    if (item && item.hasSizes) {
      if (item.prices.M !== undefined) setSize('M');
      else if (item.prices.S !== undefined) setSize('S');
      else if (item.prices.L !== undefined) setSize('L');
    }
    setInstructions(''); // Reset on new item
    setSelectedAddons([]); // Reset addons
  }, [item]);

  if (!item) return null;

  const basePrice = item.hasSizes ? (item.prices[size] || 0) : (item.prices.fixed || 0);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = (basePrice + addonsTotal) * qty;

  const handleAddonToggle = (addon: MenuItem) => {
    const isSelected = selectedAddons.some((a) => a.menuItemId === addon.id);
    if (isSelected) {
      setSelectedAddons(selectedAddons.filter((a) => a.menuItemId !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, { menuItemId: addon.id, name: addon.name, price: addon.prices.fixed || 0 }]);
    }
  };

  const handleConfirm = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      onConfirm(item, size, selectedAddons, instructions, qty, rect);
    }
  };

  const content = (
    <>
      {/* Hero Image */}
      <div className="relative w-full h-28 sm:h-36 bg-[#f8f9fa] shrink-0 border-b border-gray-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center">
            <span className="text-5xl drop-shadow-xl transform hover:scale-110 transition-transform">🍲</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
          <h2 className="text-2xl font-black text-white italic tracking-tight">{item.name}</h2>
        </div>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent hide-scrollbar">
        {/* Size Selection */}
        {item.hasSizes && (
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Choose Size</h3>
            <div className="space-y-3">
              {(['S', 'M', 'L'] as const).map(s => {
                if (item.prices[s] === undefined) return null;
                const isSelected = size === s;
                return (
                  <label key={s} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${isSelected ? 'border-[#d97706] bg-[#d97706]/10 shadow-sm' : 'border-gray-200/50 hover:border-[#d97706]/30 bg-white/50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#d97706]' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-[#d97706] rounded-full" />}
                      </div>
                      <span className="font-black text-[#431407] text-sm">{s === 'S' ? 'Regular' : s === 'M' ? 'Large' : 'Jumbo'}</span>
                    </div>
                    <span className="font-black text-[#431407]">¢{item.prices[s]?.toFixed(2)}</span>
                    <input type="radio" name="size" className="hidden" checked={isSelected} onChange={() => setSize(s)} />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {state.menu.filter(m => m.category !== 'main' && m.available).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Extra Add-ons</h3>
              <span className="text-[10px] bg-white/50 text-gray-500 px-2 py-1 rounded-md font-black uppercase">Optional</span>
            </div>
            <div className="space-y-3">
              {state.menu.filter(m => m.category !== 'main' && m.available).map(addon => {
                const isSelected = selectedAddons.some(a => a.menuItemId === addon.id);
                return (
                  <div 
                    key={addon.id} 
                    onClick={() => handleAddonToggle(addon)}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${isSelected ? 'border-[#d97706] bg-[#d97706]/10 shadow-sm' : 'border-gray-200/50 hover:border-[#d97706]/30 bg-white/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#d97706] border-[#d97706] text-white' : 'border-gray-300 bg-white/50 text-transparent'}`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="font-bold text-[#431407] text-sm">{addon.name}</span>
                    </div>
                    <span className="font-black text-[#431407]">+ ¢{addon.prices.fixed?.toFixed(2) || '0.00'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Special Instructions</h3>
            <span className="text-[10px] bg-white/50 text-gray-500 px-2 py-1 rounded-md font-black uppercase">Optional</span>
          </div>
          <textarea 
            rows={3} 
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full bg-white/50 border-2 border-gray-200/50 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#d97706]/50 focus:bg-white transition-all resize-none placeholder-gray-400" 
            placeholder="e.g. No onions, extra spicy, sauce on the side..." 
          />
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 bg-transparent border-t border-[#d97706]/10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full p-1 border border-[#d97706]/20">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-[#431407] hover:text-[#d97706] transition-colors">
              <Minus size={16} strokeWidth={3} />
            </button>
            <span className="w-10 text-center font-black text-lg text-[#431407]">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-[#431407] hover:text-[#d97706] transition-colors">
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
          
          {/* Add to Order Button */}
          <button 
            ref={btnRef}
            onClick={handleConfirm}
            className="flex-1 py-4 bg-[#431407] hover:bg-[#2a0e05] text-white rounded-full font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Add <span>•</span> ¢{total.toFixed(2)}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Mobile & Tablet Modal */}
          <div className="xl:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center sm:justify-center backdrop-blur-sm"
              onClick={onClose}
            >
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-full sm:max-w-md sm:rounded-[2rem] rounded-t-[2rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {content}
              </motion.div>
            </motion.div>
          </div>

          {/* Desktop Right Sidebar */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden xl:flex sticky top-[72px] h-[calc(100vh-72px)] w-full flex-col z-10"
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
