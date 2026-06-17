// components/admin/MenuManagement.tsx
import React, { useState } from 'react';
import { Plus, Utensils, PlusCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import MenuItemRow from './MenuItemRow';
import AddItemForm from './AddItemForm';

type Tab = 'mains' | 'addons';

export default function MenuManagement() {
  const { state } = useAppContext();
  const [tab, setTab]             = useState<Tab>('mains');
  const [showAddForm, setShowAddForm] = useState(false);

  const items = tab === 'mains' ? state.menu : state.addons;
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="p-4 flex flex-col gap-4 select-none">
      {/* Sub-tabs: Mains / Add-ons */}
      <div className="flex gap-1 bg-dark-50 p-1 rounded-xl border border-dark-100 shadow-inner">
        {(['mains', 'addons'] as Tab[]).map(t => {
          const isSelected = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-brand-500 text-white shadow-sm font-extrabold'
                  : 'text-dark-500 hover:text-dark-950 hover:bg-dark-100/40'
              }`}
            >
              {t === 'mains' ? <Utensils size={13} /> : <PlusCircle size={13} />}
              {t === 'mains' ? 'Mains' : 'Add-ons'}
            </button>
          );
        })}
      </div>

      {/* Add new item button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-secondary flex items-center justify-center gap-2 py-3"
        >
          <Plus size={16} />
          Add New {tab === 'mains' ? 'Main' : 'Add-on'}
        </button>
      )}

      {/* Add item form */}
      {showAddForm && <AddItemForm onDone={() => setShowAddForm(false)} />}

      {/* Menu item list */}
      {sorted.length === 0 ? (
        <div className="card text-center py-8 text-dark-400">
          <Utensils size={28} className="mx-auto mb-2 opacity-30 text-dark-300" />
          <p className="text-sm font-bold">No {tab} added yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map(item => (
            <MenuItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
