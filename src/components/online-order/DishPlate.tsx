import React from 'react';
import { MenuItem } from '../../types';
import { motion } from 'framer-motion';

interface DishPlateProps {
  item: MenuItem;
  onSelect: (item: MenuItem, element: HTMLElement) => void;
}

export default function DishPlate({ item, onSelect }: DishPlateProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onSelect(item, e.currentTarget);
  };

  const startPrice = item.hasSizes ? (item.prices.S || item.prices.M) : item.prices.fixed;

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="flex flex-col cursor-pointer group bg-white rounded-[2rem] p-3 shadow-[0_5px_15px_rgba(217,119,6,0.05)] hover:shadow-[0_15px_35px_rgba(217,119,6,0.15)] transition-all duration-300 border border-[#d97706]/10 hover:border-[#d97706]/40 hover:-translate-y-1 h-full"
    >
      <div className="relative w-full aspect-square sm:aspect-[4/3] mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-[#FBEFE3]">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl drop-shadow-md">🍲</span>
          </div>
        )}
      </div>
      
      <div className="w-full px-1 flex flex-col flex-1">
        <h3 className="font-black text-gray-900 text-base lg:text-lg leading-tight mb-2 line-clamp-2">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 font-medium">{item.description}</p>
        )}
        
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <span className="font-black text-xl text-gray-900">¢{startPrice}</span>
          <button className="bg-gray-100 text-gray-900 group-hover:bg-[#d97706] group-hover:text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1">
             + Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
