import React from 'react';
import { MenuItem } from '../../types';
import DishPlate from './DishPlate';

interface DishGridProps {
  items: MenuItem[];
  onSelectDish: (item: MenuItem, element: HTMLElement) => void;
}

export default function DishGrid({ items, onSelectDish }: DishGridProps) {
  const jollof = items.filter(i => i.name.toLowerCase().includes('jollof'));
  const friedRice = items.filter(i => i.name.toLowerCase().includes('fried rice') || i.name.toLowerCase().includes('assorted'));
  const banku = items.filter(i => i.name.toLowerCase().includes('banku') || i.name.toLowerCase().includes('tilapia'));
  const others = items.filter(i => !jollof.includes(i) && !friedRice.includes(i) && !banku.includes(i));

  const renderSection = (id: string, title: string, sectionItems: MenuItem[]) => {
    if (sectionItems.length === 0) return null;
    return (
      <div id={id} className="mb-12 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-black italic text-gray-900 mb-6 pb-2 border-b-2 border-gray-100">
          {title}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {sectionItems.map((item) => (
            <DishPlate key={item.id} item={item} onSelect={onSelectDish} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24">
      {renderSection('jollof', 'Bells Jollof', jollof)}
      {renderSection('fried-rice', 'Fried Rice', friedRice)}
      {renderSection('banku', 'Bells Banku', banku)}
      {renderSection('others', 'More Mains', others)}
    </div>
  );
}
