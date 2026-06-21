import React from 'react';
import { motion } from 'framer-motion';
import { FlyAnimationTask } from '../../hooks/useFlyAnimation';

interface FlyingItemProps {
  task: FlyAnimationTask;
}

export default function FlyingItem({ task }: FlyingItemProps) {
  // We offset by 15px so the center of the 30x30 animated element aligns with the startX/startY
  return (
    <motion.div
      initial={{ 
        x: task.startX - 15, 
        y: task.startY - 15, 
        scale: 1, 
        opacity: 1 
      }}
      animate={{ 
        x: task.endX - 15, 
        y: task.endY - 15, 
        scale: 0.3, 
        opacity: 0.5 
      }}
      transition={{ 
        duration: 0.7, 
        ease: [0.25, 1, 0.5, 1] // cubic-bezier ease-out
      }}
      className="fixed z-[100] pointer-events-none w-[30px] h-[30px] flex items-center justify-center bg-white rounded-full shadow-lg border border-[#E8A33D]"
    >
      <span className="text-sm">🍲</span>
    </motion.div>
  );
}
