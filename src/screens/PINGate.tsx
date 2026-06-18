// screens/PINGate.tsx
import React, { useState } from 'react';
import { Delete, Lock } from 'lucide-react';
import { useAdminPIN } from '../hooks/useAdminPIN';
import { bgPatternUrl } from '../utils/bgPattern';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

export default function PINGate() {
  const [pin, setPin] = useState('');
  const { verify, error, loading } = useAdminPIN();

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const nextPin = pin + d;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  const handleVerify = async () => {
    if (pin.length === 4) await verify(pin);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#f8f9fa] px-6 animate-fade-in relative" style={{ backgroundImage: bgPatternUrl, backgroundAttachment: 'fixed' }}>
      <div className="w-full max-w-sm bg-white border border-[#431407]/10 shadow-[0_20px_50px_rgba(67,20,7,0.15)] rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative z-10">
        {/* Lock Icon */}
        <div className="bg-[#431407] rounded-3xl p-4 shadow-lg mb-6 border-2 border-[#d97706]/40 flex items-center justify-center text-white">
          <Lock className="text-[#d97706]" size={24} strokeWidth={2.5} />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Admin Access</h2>
        <p className="text-[#d97706] text-[10px] font-black uppercase tracking-[0.2em] mb-6">Staff Keycard Gate</p>

        {/* PIN dots */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                i < pin.length
                  ? 'bg-[#d97706] border-[#d97706] scale-125 shadow-[0_0_12px_rgba(217,119,6,0.5)]'
                  : 'bg-transparent border-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs font-black mb-5 uppercase tracking-wider animate-bounce-sm">{error}</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {DIGITS.map((d, i) => {
            if (d === '') return <div key={i} />;
            if (d === 'del') return (
              <button
                key={i}
                onClick={handleDelete}
                className="flex items-center justify-center h-14 rounded-2xl bg-[#431407]/5 hover:bg-red-50 text-red-500 active:scale-95 transition-all duration-100 shadow-sm border border-transparent font-black"
              >
                <Delete size={18} />
              </button>
            );
            return (
              <button
                key={i}
                onClick={() => handleDigit(d)}
                className="flex items-center justify-center h-14 rounded-2xl bg-gray-50 hover:bg-[#d97706]/10 text-gray-900 hover:text-[#d97706] font-black text-lg active:scale-95 transition-all duration-100 shadow-sm border border-gray-100 hover:border-[#d97706]/20"
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleVerify}
          disabled={pin.length < 4 || loading}
          className="w-full mt-6 py-4 bg-[#431407] hover:bg-[#2a0e05] disabled:bg-gray-200 text-[#ffefd4] disabled:text-gray-400 font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-md shadow-[#431407]/10 hover:shadow-lg disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying PIN…' : 'Unlock Panel'}
        </button>
      </div>
    </div>
  );
}
