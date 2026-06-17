// hooks/useAdminPIN.ts
// Fetches the admin PIN from Supabase settings and verifies user input.

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

const FALLBACK_PIN = '0000';

export function useAdminPIN() {
  const { dispatch } = useAppContext();
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = useCallback(async (inputPIN: string) => {
    setLoading(true);
    setError(null);

    // Skip Supabase network call if URL is unset or a placeholder to prevent hanging requests
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (isPlaceholder) {
      if (inputPIN === FALLBACK_PIN) {
        dispatch({ type: 'UNLOCK_ADMIN' });
        setLoading(false);
        return true;
      } else {
        setError('Incorrect PIN. Try again.');
        setLoading(false);
        return false;
      }
    }

    try {
      const { data, error: dbError } = await supabase
        .from('settings')
        .select('admin_pin')
        .single();

      const correctPIN = dbError ? FALLBACK_PIN : (data?.admin_pin ?? FALLBACK_PIN);

      if (inputPIN === correctPIN) {
        dispatch({ type: 'UNLOCK_ADMIN' });
        return true;
      } else {
        setError('Incorrect PIN. Try again.');
        return false;
      }
    } catch {
      // Offline fallback
      if (inputPIN === FALLBACK_PIN) {
        dispatch({ type: 'UNLOCK_ADMIN' });
        return true;
      }
      setError('Could not verify PIN. Check connection.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const lock = useCallback(() => {
    dispatch({ type: 'LOCK_ADMIN' });
  }, [dispatch]);

  return { verify, lock, error, loading };
}
