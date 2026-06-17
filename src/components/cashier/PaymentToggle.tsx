// components/cashier/PaymentToggle.tsx
import React from 'react';
import { Banknote, Smartphone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function PaymentToggle() {
  const { state, dispatch } = useAppContext();
  const current = state.paymentMethod;

  const set = (method: 'cash' | 'momo') => {
    dispatch({ type: 'SET_PAYMENT', payload: method });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => set('cash')}
        className={`
          flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
          font-semibold text-sm border-2 transition-all duration-150 active:scale-95
          ${current === 'cash'
            ? 'bg-green-500 border-green-500 text-white shadow-sm'
            : 'bg-white border-dark-200 text-dark-600 hover:border-green-300'
          }
        `}
      >
        <Banknote size={16} />
        Cash
      </button>
      <button
        onClick={() => set('momo')}
        className={`
          flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
          font-semibold text-sm border-2 transition-all duration-150 active:scale-95
          ${current === 'momo'
            ? 'bg-yellow-400 border-yellow-400 text-dark-900 shadow-sm'
            : 'bg-white border-dark-200 text-dark-600 hover:border-yellow-300'
          }
        `}
      >
        <Smartphone size={16} />
        MoMo
      </button>
    </div>
  );
}
