import { useEffect, useState } from 'react';
import {
  getPendingSyncCount,
  PENDING_SYNC_CHANGED_EVENT,
  syncAllPendingOrders,
} from '../utils/offlineQueue';

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(getPendingSyncCount);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const refreshCount = () => setPendingCount(getPendingSyncCount());

    const handleOnline = () => {
      setIsOnline(true);
      syncAllPendingOrders().finally(refreshCount);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(PENDING_SYNC_CHANGED_EVENT, refreshCount);
    window.addEventListener('storage', refreshCount);

    if (navigator.onLine) {
      syncAllPendingOrders().finally(refreshCount);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(PENDING_SYNC_CHANGED_EVENT, refreshCount);
      window.removeEventListener('storage', refreshCount);
    };
  }, []);

  return { pendingCount, isOnline };
}
