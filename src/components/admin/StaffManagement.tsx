import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CashierUser } from '../../types';
import { 
  UserPlus, 
  Trash2, 
  User, 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function StaffManagement() {
  const { state, dispatch } = useApp();
  
  // Form state
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'cashier' | 'admin'>('cashier');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validation
    if (!name.trim()) {
      setError('Please enter a name for the staff member.');
      return;
    }
    if (!emailOrPhone.trim()) {
      setError('Please enter an email or phone number.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    // Check for duplicates
    const exists = state.staff.some(
      (s) => s.emailOrPhone.toLowerCase() === emailOrPhone.trim().toLowerCase()
    );
    if (exists) {
      setError('A staff member with this email or phone number already exists.');
      return;
    }

    const newStaff: CashierUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      emailOrPhone: emailOrPhone.trim(),
      passwordHash: password, // plaintext for mock phase
      role,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_STAFF', payload: newStaff });
    
    // Clear inputs
    setName('');
    setEmailOrPhone('');
    setPassword('');
    setRole('cashier');
    setSuccess(`Staff account for ${newStaff.name} created successfully!`);
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRemoveStaff = (id: string, staffName: string) => {
    // Prevent removing oneself
    if (state.currentUser?.id === id) {
      setError("You cannot revoke your own active account session.");
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (window.confirm(`Are you sure you want to revoke terminal access for ${staffName}?`)) {
      dispatch({ type: 'REMOVE_STAFF', payload: id });
      setSuccess(`Revoked terminal access for ${staffName}.`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-hidden select-none">
      
      {/* List of active staff (Left/Main Panel) */}
      <div className="flex-1 bg-white border border-dark-100 rounded-3xl p-6 shadow-card flex flex-col min-h-[350px] overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-dark-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-dark-950">Active Terminals & Staff</h2>
            <p className="text-xs text-dark-500 mt-0.5">Manage accounts allowed to log into this POS device.</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-600 px-3 py-1.5 rounded-xl border border-brand-100">
            {state.staff.length} Users Seeded
          </span>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3.5 custom-scrollbar">
          {state.staff.map((member) => {
            const isSelf = state.currentUser?.id === member.id;
            return (
              <div 
                key={member.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isSelf 
                    ? 'border-brand-200 bg-brand-50/20 shadow-sm' 
                    : 'border-dark-100 bg-dark-50/20 hover:bg-dark-50/60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    member.role === 'admin' 
                      ? 'bg-gradient-to-tr from-brand-600 to-brand-400 text-white' 
                      : 'bg-dark-100 text-dark-800'
                  }`}>
                    {member.role === 'admin' ? <ShieldCheck size={18} /> : <User size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-dark-950">{member.name}</span>
                      {member.role === 'admin' && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 bg-brand-100/40 border border-brand-200/50 px-2 py-0.5 rounded-md">
                          Admin
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-dark-500 bg-dark-200 px-2 py-0.5 rounded-md">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <span className="text-[11px] text-dark-600 font-medium">{member.emailOrPhone}</span>
                      <span className="text-[9px] text-dark-400 font-medium">Added on {new Date(member.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemoveStaff(member.id, member.name)}
                    disabled={isSelf}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isSelf 
                        ? 'opacity-30 cursor-not-allowed border-dark-100 text-dark-300' 
                        : 'border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100/60 text-red-600'
                    }`}
                    title={isSelf ? 'Cannot remove yourself' : 'Revoke Account Access'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Staff (Right Panel Form) */}
      <div className="w-full md:w-80 bg-white border border-dark-100 rounded-3xl p-6 shadow-card flex flex-col flex-shrink-0">
        <div className="flex items-center gap-2 pb-4 border-b border-dark-100 mb-4">
          <UserPlus className="text-brand-500" size={18} />
          <h2 className="text-sm font-black text-dark-950">Add Staff Member</h2>
        </div>

        <form onSubmit={handleAddStaff} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3.5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex items-start gap-2 text-[11px] text-red-600 animate-bounce-sm">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-3 flex items-start gap-2 text-[11px] text-green-700 animate-fade-in">
                <Check size={14} className="flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[9px] text-dark-500 font-bold uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Osman Diallo"
                className="w-full bg-dark-50/60 border border-dark-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-dark-950 placeholder-dark-400 transition-all outline-none"
              />
            </div>

            {/* Email / Phone */}
            <div className="space-y-1">
              <label className="text-[9px] text-dark-500 font-bold uppercase tracking-wider">Email or Phone Number</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g. cashier2@bells.com or 0501234567"
                className="w-full bg-dark-50/60 border border-dark-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-dark-950 placeholder-dark-400 transition-all outline-none"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[9px] text-dark-500 font-bold uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 4 characters"
                className="w-full bg-dark-50/60 border border-dark-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-3.5 py-2.5 text-xs text-dark-950 placeholder-dark-400 transition-all outline-none"
              />
            </div>

            {/* Role Switcher */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-dark-500 font-bold uppercase tracking-wider">System Access Level</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-dark-50 border border-dark-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('cashier')}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    role === 'cashier'
                      ? 'bg-white text-dark-950 shadow-sm border border-dark-100'
                      : 'text-dark-500 hover:text-dark-800'
                  }`}
                >
                  Cashier
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    role === 'admin'
                      ? 'bg-white text-dark-950 shadow-sm border border-dark-100'
                      : 'text-dark-500 hover:text-dark-800'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs tracking-wider uppercase transition-all shadow-md shadow-brand-500/10"
          >
            <Plus size={14} />
            Add Account
          </button>
        </form>
      </div>

    </div>
  );
}
