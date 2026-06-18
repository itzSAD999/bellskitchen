// components/admin/MenuManagement.tsx
import React, { useState } from 'react';
import { Plus, Utensils, PlusCircle, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import MenuItemRow from './MenuItemRow';
import AddItemForm from './AddItemForm';

type Tab = 'mains' | 'addons';

export default function MenuManagement() {
  const { state, dispatch } = useAppContext();
  const [tab, setTab]             = useState<Tab>('mains');
  const [showAddFormMobile, setShowAddFormMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'outofstock'>('all');

  const items = tab === 'mains' ? state.menu : state.addons;
  
  // Sort items sequentially by sortOrder. If sortOrder is undefined, default to 999.
  const sorted = [...items].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

  // Swap function for moving items up/down
  const handleMoveItem = async (itemId: string, direction: 'up' | 'down') => {
    const idx = sorted.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const currentItem = sorted[idx];
    const targetItem = sorted[targetIdx];

    // Assign sequential sortOrder values
    const currentSortOrder = targetIdx + 1;
    const targetSortOrder = idx + 1;

    // Dispatch locally to context
    dispatch({
      type: 'UPDATE_MENU_ITEM',
      payload: { id: currentItem.id, sortOrder: currentSortOrder }
    });
    dispatch({
      type: 'UPDATE_MENU_ITEM',
      payload: { id: targetItem.id, sortOrder: targetSortOrder }
    });

    // Update Supabase to persist custom sort order
    try {
      await supabase.from('menu_items')
        .update({ sort_order: currentSortOrder })
        .eq('id', currentItem.id);

      await supabase.from('menu_items')
        .update({ sort_order: targetSortOrder })
        .eq('id', targetItem.id);
    } catch (err) {
      console.warn('Could not save sort order to Supabase:', err);
    }
  };

  // Filter items
  const filtered = sorted.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAvailability = availabilityFilter === 'all' 
      ? true 
      : availabilityFilter === 'available' 
        ? item.available 
        : !item.available;

    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 md:gap-8 select-none bg-transparent">
      {/* Desktop Left Sidebar: Add New Item Form (Permanently docked on desktop lg+) */}
      <div className="hidden lg:block w-[360px] flex-shrink-0 sticky top-6 h-fit">
        <AddItemForm onDone={() => {}} docked={true} />
      </div>

      {/* Main List Area */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Header with stats */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200/50">
          <div>
            <h2 className="text-lg font-black text-[#431407] uppercase tracking-wider">Menu Management</h2>
            <p className="text-[11px] text-gray-500 font-bold mt-0.5">Manage dishes, sizes, addons, and availability</p>
          </div>
          <span className="bg-[#431407] text-[#ffefd4] font-black text-xs px-3.5 py-1.5 rounded-xl border border-[#d97706]/30 shadow-sm">
            Total: {sorted.length} {tab === 'mains' ? 'Mains' : 'Add-ons'}
          </span>
        </div>

        {/* Sub-tabs & Mobile Add Button Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sub-tabs: Mains / Add-ons */}
          <div className="flex-1 flex gap-1 bg-white p-1 rounded-2xl border border-gray-200 shadow-inner">
            {(['mains', 'addons'] as Tab[]).map(t => {
              const isSelected = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setSearchQuery('');
                  }}
                  className={`flex-grow py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#d97706] text-white shadow-md'
                      : 'text-gray-500 hover:text-[#431407]'
                  }`}
                >
                  {t === 'mains' ? <Utensils size={13} /> : <PlusCircle size={13} />}
                  {t === 'mains' ? 'Mains' : 'Add-ons'}
                </button>
              );
            })}
          </div>

          {/* Mobile Add New Item Button (only visible below lg screen width) */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={() => setShowAddFormMobile(!showAddFormMobile)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 bg-[#431407] hover:bg-[#2a0e05] text-[#ffefd4] font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-95 border border-[#d97706]/35"
            >
              <Plus size={16} />
              {showAddFormMobile ? 'Close Form' : `Add ${tab === 'mains' ? 'Main' : 'Add-on'}`}
            </button>
          </div>
        </div>

        {/* Mobile-only Add Item form */}
        {showAddFormMobile && (
          <div className="lg:hidden animate-scale-in">
            <AddItemForm onDone={() => setShowAddFormMobile(false)} docked={false} />
          </div>
        )}

        {/* Search & Advanced Filters Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative flex items-center">
            <Search size={15} className="absolute left-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name or ingredients..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Availability Filter Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-200 flex-shrink-0">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'available', label: 'Available' },
              { id: 'outofstock', label: 'Out of Stock' }
            ].map(filter => {
              const isSelected = availabilityFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setAvailabilityFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#d97706] shadow-sm border border-[#d97706]/15 font-black'
                      : 'text-gray-500 hover:text-[#431407]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu item list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-200/60 p-12 text-center shadow-sm max-w-md mx-auto mt-6">
            <Utensils size={28} className="mx-auto mb-2 text-[#d97706] opacity-40 animate-pulse" />
            <p className="text-sm font-black text-gray-800 uppercase tracking-wider">No items match filters</p>
            <p className="text-xs text-gray-400 mt-1 font-semibold leading-relaxed">Adjust your search or add a new menu item.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-1 hide-scrollbar">
            {filtered.map(item => {
              const sortedIdx = sorted.findIndex(i => i.id === item.id);
              const onMoveUp = sortedIdx > 0 ? () => handleMoveItem(item.id, 'up') : undefined;
              const onMoveDown = sortedIdx < sorted.length - 1 ? () => handleMoveItem(item.id, 'down') : undefined;

              return (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
