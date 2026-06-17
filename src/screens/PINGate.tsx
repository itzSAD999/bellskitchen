// screens/PINGate.tsx
import React, { useState } from 'react';
import { Delete, Lock } from 'lucide-react';
import { useAdminPIN } from '../hooks/useAdminPIN';

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
    <div className="flex flex-col items-center justify-center h-full bg-brand-50 px-6 animate-fade-in">
      {/* Lock Icon */}
      <div className="bg-gradient-to-br from-brand-500 to-amber-500 rounded-[2rem] p-5 shadow-warm-lg mb-8 border border-white/20">
        <Lock className="text-white" size={32} strokeWidth={2.2} />
      </div>

      <h2 className="text-2xl font-extrabold text-dark-950 mb-1">Admin Access</h2>
      <p className="text-dark-400 text-xs font-semibold uppercase tracking-widest mb-8">Enter your 4-digit PIN</p>

      {/* PIN dots */}
      <div className="flex gap-4 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              i < pin.length
                ? 'bg-brand-500 border-brand-500 scale-125 shadow-[0_0_10px_rgba(249,127,10,0.4)]'
                : 'bg-transparent border-dark-200'
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs font-semibold mb-6 uppercase tracking-wider animate-bounce-sm">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {DIGITS.map((d, i) => {
          if (d === '') return <div key={i} />;
          if (d === 'del') return (
            <button
              key={i}
              onClick={handleDelete}
              className="flex items-center justify-center h-16 rounded-2xl bg-white border border-dark-100 hover:border-brand-300 text-dark-600 active:bg-brand-50 active:scale-95 transition-all duration-100 shadow-sm font-bold"
            >
              <Delete size={20} />
            </button>
          );
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              className="flex items-center justify-center h-16 rounded-2xl bg-white border border-dark-100 hover:border-brand-300 text-dark-950 font-extrabold text-xl active:bg-brand-50 active:scale-95 transition-all duration-100 shadow-sm"
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
        className="btn-primary w-full max-w-xs mt-8 disabled:opacity-40 disabled:cursor-not-allowed py-4"
      >
        {loading ? 'Verifying PIN…' : 'Unlock Panel'}
      </button>
    </div>
  );
}
