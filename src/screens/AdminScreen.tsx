// screens/AdminScreen.tsx
import React, { useState } from 'react';
import { LogOut, BarChart2, UtensilsCrossed, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAdminPIN } from '../hooks/useAdminPIN';
import PINGate from './PINGate';
import SalesDashboard from '../components/admin/SalesDashboard';
import MenuManagement from '../components/admin/MenuManagement';
import StaffManagement from '../components/admin/StaffManagement';

type AdminTab = 'sales' | 'menu' | 'staff';

export default function AdminScreen() {
  const { state } = useAppContext();
  const { lock }  = useAdminPIN();
  const [activeTab, setActiveTab] = useState<AdminTab>('sales');

  // Show PIN gate if not unlocked
  if (!state.adminUnlocked) {
    return <PINGate />;
  }

  return (
    <div className="flex flex-col h-full bg-brand-50">
      {/* Tab selection and Lock button row */}
      <div className="flex items-center justify-between bg-white border-b border-brand-100 px-5 flex-shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-3 py-4 text-xs uppercase tracking-widest font-black border-b-2 transition-all duration-150 ${
              activeTab === 'sales'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-dark-400 hover:text-dark-700'
            }`}
          >
            <BarChart2 size={15} />
            Sales
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3 py-4 text-xs uppercase tracking-widest font-black border-b-2 transition-all duration-150 ${
              activeTab === 'menu'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-dark-400 hover:text-dark-700'
            }`}
          >
            <UtensilsCrossed size={15} />
            Menu
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-3 py-4 text-xs uppercase tracking-widest font-black border-b-2 transition-all duration-150 ${
              activeTab === 'staff'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-dark-400 hover:text-dark-700'
            }`}
          >
            <Users size={15} />
            Staff
          </button>
        </div>
        
        {/* Lock button inline */}
        <button
          onClick={lock}
          className="flex items-center gap-1.5 bg-dark-50 border border-dark-200/50 hover:bg-dark-100 hover:border-dark-300 text-dark-700 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all duration-150 shadow-sm"
        >
          <LogOut size={12} />
          Lock
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sales' && <SalesDashboard />}
        {activeTab === 'menu'  && <MenuManagement />}
        {activeTab === 'staff' && <StaffManagement />}
      </div>
    </div>
  );
}
