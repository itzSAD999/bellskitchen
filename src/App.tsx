import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ShoppingCart, Settings, LogOut, ShieldCheck, User, Clock } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import CashierScreen from './screens/CashierScreen';
import AdminScreen from './screens/AdminScreen';
import LandingScreen from './screens/LandingScreen';
import OrdersScreen from './screens/OrdersScreen';
import { bgPatternUrl } from './utils/bgPattern';
import './styles/index.css';
import './styles/print.css';

function AppContent() {
  const { state, dispatch } = useApp();

  // If not logged in, intercept and show the B2C Landing Screen with Login Gate
  if (!state.currentUser) {
    return <LandingScreen />;
  }

  const isAdmin = state.currentUser.role === 'admin';

  return (
    <BrowserRouter>
      {/* Full-height responsive layout */}
      <div 
        className="flex flex-col h-dvh w-full md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-[#f8f9fa] overflow-hidden relative md:border-x border-[#431407]/10 shadow-2xl transition-all"
        style={{ backgroundImage: bgPatternUrl, backgroundAttachment: 'fixed' }}
      >

        {/* Unified Shared Header at the Top - Brand Cohesive Red & Orange design */}
        <header className="bg-[#431407] px-6 py-4 flex items-center justify-between border-b-4 border-[#d97706] z-30 flex-shrink-0 shadow-xl relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-sm text-sm select-none">
              <span>🔔</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm md:text-base tracking-tight select-none">Bells Kitchen</span>
              <span className="text-[8px] md:text-[9px] text-amber-300 font-bold uppercase tracking-wider leading-none">Terminal POS</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Pill Navigation Tabs - Dark themed brand selector */}
            <div className="flex items-center gap-0.5 bg-black/15 border border-white/10 p-0.5 rounded-xl shadow-inner">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 sm:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all select-none border border-transparent ${
                    isActive
                      ? 'bg-[#d97706] text-white shadow-md border-[#ffefd4]/20 scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`
                }
              >
                <ShoppingCart size={12} strokeWidth={2.5} />
                <span className="hidden sm:inline">Cashier</span>
              </NavLink>
              
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 sm:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all select-none border border-transparent ${
                    isActive
                      ? 'bg-[#d97706] text-white shadow-md border-[#ffefd4]/20 scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`
                }
              >
                <Clock size={12} strokeWidth={2.5} />
                <span className="hidden sm:inline">History</span>
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-2.5 sm:px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all select-none border border-transparent ${
                      isActive
                        ? 'bg-[#d97706] text-white shadow-md border-[#ffefd4]/20 scale-105'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                    }`
                  }
                >
                  <Settings size={12} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Admin</span>
                </NavLink>
              )}
            </div>

            {/* Active User Session Info - Cohesive with brown/amber background */}
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 pl-3 pr-1 py-1 rounded-xl shadow-md">
              <div className="flex items-center gap-1.5 text-right hidden sm:flex">
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-black text-white">{state.currentUser.name}</span>
                  <span className="text-[8px] font-bold text-[#d97706] uppercase tracking-widest leading-none mt-0.5">{state.currentUser.role}</span>
                </div>
                {isAdmin ? <ShieldCheck size={14} className="text-[#d97706]" /> : <User size={14} className="text-white/80" />}
              </div>
              <button 
                onClick={() => dispatch({ type: 'LOGOUT_USER' })}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-red-600/40 text-white/80 hover:text-white border border-white/10 hover:border-red-500/20 transition-all"
                title="Sign Out"
              >
                <LogOut size={12} />
              </button>
            </div>
          </div>
        </header>

        {/* Routed screen — takes all remaining height */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/"      element={<CashierScreen />} />
            <Route path="/orders" element={<OrdersScreen />} />
            {isAdmin && <Route path="/admin" element={<AdminScreen />} />}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
