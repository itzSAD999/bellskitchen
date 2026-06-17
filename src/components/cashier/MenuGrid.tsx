// components/cashier/MenuGrid.tsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import MenuCard from './MenuCard';
import { MenuItem } from '../../types';

interface Props {
  onSelect: (item: MenuItem) => void;
}

export default function MenuGrid({ onSelect }: Props) {
  const { state } = useAppContext();
  const mains = state.menu
    .filter(item => item.category === 'main')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (mains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-dark-400">
        <span className="text-4xl mb-3">🍽️</span>
        <p className="font-medium">Loading menu…</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">
        Main Dishes
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mains.map(item => (
          <MenuCard key={item.id} item={item} onTap={onSelect} />
        ))}
      </div>
    </div>
  );
}
