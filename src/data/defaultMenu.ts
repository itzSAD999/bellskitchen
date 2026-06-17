// data/defaultMenu.ts

import { MenuItem } from '../types';

export const defaultMenu: MenuItem[] = [
  // MAINS
  { id: 'item_001', name: 'Fried Rice',          category: 'main',  hasSizes: true,  prices: { S: 35, M: 40, L: 45 }, available: true, sortOrder: 1 },
  { id: 'item_002', name: 'Jollof Rice',          category: 'main',  hasSizes: true,  prices: { S: 35, M: 40, L: 45 }, available: true, sortOrder: 2 },
  { id: 'item_003', name: 'Mixture',              category: 'main',  hasSizes: true,  prices: { S: 35, M: 40, L: 45 }, available: true, sortOrder: 3 },
  { id: 'item_004', name: 'Banku & Tilapia',      category: 'main',  hasSizes: true,  prices: { S: 60, M: 65, L: 70 }, available: true, sortOrder: 4 },
  { id: 'item_005', name: 'Asorted Fried Rice',   category: 'main',  hasSizes: true,  prices: { S: 60, M: 65, L: 70 }, available: true, sortOrder: 5 },
  { id: 'item_006', name: 'Asorted Jollof Rice',  category: 'main',  hasSizes: true,  prices: { S: 60, M: 65, L: 70 }, available: true, sortOrder: 6 },

  // ADDONS
  { id: 'item_007', name: 'Ripe Plantain (Kokoo)', category: 'addon', hasSizes: false, prices: { fixed: 1  }, available: true, sortOrder: 1 },
  { id: 'item_008', name: 'Big Sausage',           category: 'addon', hasSizes: false, prices: { fixed: 7  }, available: true, sortOrder: 2 },
  { id: 'item_009', name: 'Small Sausage',         category: 'addon', hasSizes: false, prices: { fixed: 3  }, available: true, sortOrder: 3 },
  { id: 'item_010', name: 'Extra Chicken',         category: 'addon', hasSizes: false, prices: { fixed: 15 }, available: true, sortOrder: 4 },
  { id: 'item_011', name: 'Egg',                   category: 'addon', hasSizes: false, prices: { fixed: 3  }, available: true, sortOrder: 5 },
];
