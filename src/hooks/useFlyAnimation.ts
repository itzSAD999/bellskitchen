import { useState, useCallback } from 'react';

export interface FlyAnimationTask {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  emojiOrImage: string;
}

export function useFlyAnimation() {
  const [animations, setAnimations] = useState<FlyAnimationTask[]>([]);

  const triggerFly = useCallback((startRect: DOMRect, endRect: DOMRect, emojiOrImage: string) => {
    const id = crypto.randomUUID();
    
    // We want the flying item to start from the center of the start element
    // and land at the center of the end element.
    const task: FlyAnimationTask = {
      id,
      startX: startRect.left + startRect.width / 2,
      startY: startRect.top + startRect.height / 2,
      endX: endRect.left + endRect.width / 2,
      endY: endRect.top + endRect.height / 2,
      emojiOrImage,
    };

    setAnimations((prev) => [...prev, task]);

    // Cleanup animation after it completes (700ms match duration in FlyingItem)
    setTimeout(() => {
      setAnimations((prev) => prev.filter((t) => t.id !== id));
    }, 700);
  }, []);

  return {
    animations,
    triggerFly,
  };
}
