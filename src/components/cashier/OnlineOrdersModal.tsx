import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface OnlineOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export default function OnlineOrdersModal({ isOpen, onClose, orders }: OnlineOrdersModalProps) {
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const handlePrint = async (order: Order) => {
    try {
      // Mark as printed
      await supabase.from('orders').update({ printed: true }).eq('id', order.id);
      
      // Print receipt
      setPrintOrder(order);
      setTimeout(() => {
        window.print();
        setPrintOrder(null);
      }, 100);
    } catch (err) {
      console.error('Failed to mark as printed', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-[#f8f9fa] z-[60] shadow-2xl flex flex-col"
          >
            <div className="p-6 bg-[#431407] flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Online Orders</h2>
                  <p className="text-[10px] text-amber-300 font-bold tracking-widest uppercase">Needs Printing</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <span className="text-5xl mb-3">✅</span>
                  <p className="font-black text-[#431407] uppercase tracking-widest text-xs">All caught up!</p>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">No pending online orders.</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-[#d97706]/20">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Order Number</span>
                        <h3 className="text-2xl font-black text-[#d97706] tracking-tighter leading-none">#{String(order.orderNumber).padStart(3, '0')}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Total Paid</span>
                        <span className="text-lg font-black text-gray-900 leading-none">¢{order.total.toFixed(2)}</span>
                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold ml-1 mt-1 inline-block uppercase">Paid</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start text-xs font-bold text-gray-700">
                          <div>
                            <span className="font-black text-gray-900">{item.quantity}x</span> {item.name} <span className="text-gray-400">({item.size})</span>
                            {item.addons.length > 0 && (
                              <div className="text-[10px] text-gray-400 pl-4 mt-0.5">+ {item.addons.map(a => a.name).join(', ')}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => handlePrint(order)}
                      className="w-full py-3 bg-[#431407] hover:bg-[#2a0e05] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <Printer size={16} /> Print & Clear
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
