import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Ticket } from 'lucide-react';

interface ConfirmationModalProps {
  orderNumber: number;
  onClose: () => void;
}

export default function ConfirmationModal({ orderNumber, onClose }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-[#FBEFE3] -z-10" />
        
        <div className="w-20 h-20 bg-[#B23A2F] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-white">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        
        <h2 className="text-3xl font-black italic text-[#241D1B] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
          Order Confirmed!
        </h2>
        
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 my-6 shadow-inner">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Order Number</p>
          <div className="flex items-center justify-center gap-2 text-5xl font-black text-[#E8A33D] tracking-tighter">
            <Ticket size={32} className="text-[#E8A33D]" />
            {String(orderNumber).padStart(3, '0')}
          </div>
        </div>

        <div className="space-y-4 mb-8 text-sm font-semibold text-gray-600">
          <p>
            <span className="font-black text-[#241D1B]">Estimated Pickup:</span> ~15-20 mins
          </p>
          <p className="px-4 text-xs">
            Listen for your number at the counter when you arrive — no need to queue!
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 rounded-full text-white text-sm font-black tracking-wider uppercase transition-all shadow-lg hover:-translate-y-0.5 bg-[#241D1B] hover:bg-black"
        >
          Start New Order
        </button>
      </motion.div>
    </div>
  );
}
