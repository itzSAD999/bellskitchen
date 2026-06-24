// hooks/useMenu.ts
// Fetches menu_items from Supabase and caches locally for offline use.

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { MenuItem } from '../types';
import { defaultMenu } from '../data/defaultMenu';
import { cacheMenuItems, getCachedMenuItems } from '../utils/offlineQueue';

function mapRow(row: Record<string, unknown>): MenuItem {
  return {
    id:        row.id as string,
    name:      row.name as string,
    category:  row.category as 'main' | 'addon',
    hasSizes:  row.has_sizes as boolean,
    prices: {
      S:     row.price_s as number | undefined,
      M:     row.price_m as number | undefined,
      L:     row.price_l as number | undefined,
      fixed: row.price_fixed as number | undefined,
    },
    available: row.available as boolean,
    sortOrder: row.sort_order as number,
    description: row.description as string | undefined,
    imageUrl:  row.image_url as string | undefined,
  };
}

export function useMenu() {
  const { dispatch } = useAppContext();

  useEffect(() => {
    let cancelled = false;

    const cached = getCachedMenuItems();
    if (cached) {
      dispatch({ type: 'SET_MENU', payload: cached });
    }

    async function fetchMenu() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        if (!cached) {
          console.warn('Using default menu (Supabase unavailable or empty):', error?.message);
          dispatch({ type: 'SET_MENU', payload: defaultMenu });
        }
      } else {
        const menu = data.map(mapRow);
        cacheMenuItems(menu);
        dispatch({ type: 'SET_MENU', payload: menu });
      }
    }

    fetchMenu();
    return () => { cancelled = true; };
  }, [dispatch]);
}
