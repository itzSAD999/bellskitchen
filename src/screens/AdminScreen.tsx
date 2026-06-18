// screens/AdminScreen.tsx
import React, { useState } from 'react';
import { LogOut, BarChart2, UtensilsCrossed, Users, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAdminPIN } from '../hooks/useAdminPIN';
import PINGate from './PINGate';
import SalesDashboard from '../components/admin/SalesDashboard';
import MenuManagement from '../components/admin/MenuManagement';
import StaffManagement from '../components/admin/StaffManagement';
import StoreSettings from '../components/admin/StoreSettings';

type AdminTab = 'sales' | 'menu' | 'staff' | 'settings';

export default function AdminScreen() {
  const { state } = useAppContext();
  const { lock }  = useAdminPIN();
  const [activeTab, setActiveTab] = useState<AdminTab>('sales');

  // Show PIN gate if not unlocked
  if (!state.adminUnlocked) {
    return <PINGate />;
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      {/* Tab selection and Lock button row */}
      <div className="flex items-center justify-between bg-[#431407] border-b-4 border-brand-500 px-5 flex-shrink-0 shadow-lg relative z-10">
        <div className="flex gap-1 pt-2">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-4 py-4 text-xs uppercase tracking-widest font-black border-b-4 transition-all duration-150 ${
              activeTab === 'sales'
                ? 'border-brand-500 text-brand-500 bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 rounded-t-xl'
            }`}
          >
            <BarChart2 size={16} />
            Sales
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-4 text-xs uppercase tracking-widest font-black border-b-4 transition-all duration-150 ${
              activeTab === 'menu'
                ? 'border-brand-500 text-brand-500 bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 rounded-t-xl'
            }`}
          >
            <UtensilsCrossed size={16} />
            Menu
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-4 text-xs uppercase tracking-widest font-black border-b-4 transition-all duration-150 ${
              activeTab === 'staff'
                ? 'border-brand-500 text-brand-500 bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 rounded-t-xl'
            }`}
          >
            <Users size={16} />
            Staff
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-4 text-xs uppercase tracking-widest font-black border-b-4 transition-all duration-150 ${
              activeTab === 'settings'
                ? 'border-brand-500 text-brand-500 bg-brand-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 rounded-t-xl'
            }`}
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
        
        {/* Lock button inline */}
        <button
          onClick={lock}
          className="flex items-center gap-1.5 bg-white/10 border border-white/20 hover:bg-red-500 hover:border-red-500 hover:text-white text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-300 shadow-sm mb-2"
        >
          <LogOut size={14} />
          Lock Terminal
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sales' && <SalesDashboard />}
        {activeTab === 'menu'  && <MenuManagement />}
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'settings' && <StoreSettings />}
      </div>
    </div>
  );
}
