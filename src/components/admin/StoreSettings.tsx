// components/admin/StoreSettings.tsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Check, AlertCircle, TrendingUp, Settings } from 'lucide-react';

export default function StoreSettings() {
  const { state, dispatch } = useApp();
  const { isOpen, deliveryFee, taxRate } = state.storeSettings;
  
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);
  const [localDelivery, setLocalDelivery] = useState(deliveryFee.toString());
  const [localTax, setLocalTax] = useState(taxRate.toString());
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        isOpen: localIsOpen,
        deliveryFee: parseFloat(localDelivery) || 0,
        taxRate: parseFloat(localTax) || 0,
      }
    });
    setSuccess('Store settings updated successfully.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-4 flex flex-col gap-6 max-w-3xl mx-auto select-none">
      <div className="bg-white rounded-[2rem] border border-dark-100 p-6 shadow-card flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-dark-100 pb-4">
          <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-dark-950">Global Settings</h2>
            <p className="text-xs text-dark-500 font-medium mt-0.5">Manage store status and operational variables</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-2 text-sm font-bold text-green-700 animate-fade-in">
            <Check size={18} className="flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Store Status Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-dark-100 bg-dark-50/50">
          <div className="flex items-start gap-3 mb-4 sm:mb-0">
            <Store className={localIsOpen ? "text-green-500" : "text-red-500"} size={24} />
            <div>
              <h3 className="text-sm font-black text-dark-900">Store Status</h3>
              <p className="text-[11px] text-dark-500 font-medium leading-tight mt-1">
                Toggle to temporarily close the store. This will disable the "Order Now" button on the customer website.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setLocalIsOpen(!localIsOpen)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${localIsOpen ? 'bg-green-500' : 'bg-red-500'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${localIsOpen ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Delivery Fee */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-dark-100 bg-dark-50/50">
          <div className="flex items-start gap-3 mb-4 sm:mb-0">
            <TrendingUp className="text-brand-500" size={24} />
            <div>
              <h3 className="text-sm font-black text-dark-900">Standard Delivery Fee (¢)</h3>
              <p className="text-[11px] text-dark-500 font-medium leading-tight mt-1">
                The base fee charged for delivery orders.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 font-black">¢</span>
            <input 
              type="number" 
              value={localDelivery} 
              onChange={e => setLocalDelivery(e.target.value)} 
              className="input pl-8 w-32 font-black text-brand-600 text-center"
            />
          </div>
        </div>

        {/* Tax Rate */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-dark-100 bg-dark-50/50">
          <div className="flex items-start gap-3 mb-4 sm:mb-0">
            <AlertCircle className="text-brand-500" size={24} />
            <div>
              <h3 className="text-sm font-black text-dark-900">VAT / Tax Rate (%)</h3>
              <p className="text-[11px] text-dark-500 font-medium leading-tight mt-1">
                Tax percentage applied to the final order amount.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 font-black">%</span>
            <input 
              type="number" 
              value={localTax} 
              onChange={e => setLocalTax(e.target.value)} 
              className="input pr-8 w-32 font-black text-brand-600 text-center"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-dark-100 flex justify-end">
          <button 
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Check size={18} />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
