// context/AppContext.tsx
//
// Global state for Bells Kitchen POS.
// React Context + useReducer — all 14 actions from SPEC.md Section 7.
// Initial menu data is seeded from defaultMenu.ts (no Supabase on boot).

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, MenuItem, Order, CashierUser } from '../types';
import { defaultMenu } from '../data/defaultMenu';

// ─── Action Types (Section 7.2) ────────────────────────────────────────────────

export type AppAction =
  // Bundle-building flow
  | { type: 'START_BUNDLE';    payload: { menuItemId: string; size: 'S' | 'M' | 'L'; customPrice?: number; cartItemId?: string } }
  | { type: 'CONFIRM_BUNDLE';  payload: Omit<import('../types').BundleItem, 'cartItemId'> }
  | { type: 'REMOVE_BUNDLE';   payload: string }   // cartItemId
  | { type: 'INCREMENT_BUNDLE_QTY'; payload: string }
  | { type: 'DECREMENT_BUNDLE_QTY'; payload: string }
  | { type: 'UPDATE_BUNDLE_QTY'; payload: { cartItemId: string; quantity: number } }

  // Payment + checkout
  | { type: 'SET_PAYMENT';     payload: 'cash' | 'momo' }
  | { type: 'CONFIRM_ORDER';   payload?: { status?: 'completed' | 'pending'; paymentMethod?: 'cash' | 'momo' } }
  | { type: 'COMPLETE_PENDING_ORDER'; payload: { id: string; paymentMethod: 'cash' | 'momo' } }
  | { type: 'CANCEL_PENDING_ORDER'; payload: string } // orderId
  | { type: 'CANCEL_ORDER' }
  | { type: 'NEW_ORDER' }

  // Data hydration (from Supabase hooks)
  | { type: 'SET_MENU';        payload: MenuItem[] }
  | { type: 'SET_ORDERS';      payload: Order[] }

  // Menu management (admin)
  | { type: 'UPDATE_MENU_ITEM'; payload: Partial<MenuItem> & { id: string } }
  | { type: 'ADD_MENU_ITEM';    payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'TOGGLE_AVAILABLE'; payload: string }   // menuItemId
  | { type: 'UPDATE_SETTINGS';  payload: Partial<import('../types').StoreSettings> }

  // Admin auth
  | { type: 'UNLOCK_ADMIN' }
  | { type: 'LOCK_ADMIN' }
  // Dismiss the AddonSheet without adding a bundle (back button / backdrop tap)
  | { type: 'CANCEL_PENDING' }

  // Cashier Session & Staff Management
  | { type: 'LOGIN_USER';      payload: CashierUser }
  | { type: 'LOGOUT_USER' }
  | { type: 'ADD_STAFF';       payload: CashierUser }
  | { type: 'REMOVE_STAFF';    payload: string };   // userId

// ─── Internal state ────────────────────────────────────────────────────────────
// Extends AppState with session-only counters not exposed to consumers.

interface State extends AppState {
  /** Local order counter. Replaced by Supabase's next_order_number in Phase 2. */
  _nextOrderNumber: number;
}

// ─── Initial State ─────────────────────────────────────────────────────────────
// Menu is seeded immediately from defaultMenu.ts so the app works offline.

const initialStaff: CashierUser[] = [
  {
    id: 'admin-email-id',
    name: 'Bells Admin',
    role: 'admin',
    emailOrPhone: 'admin@bells.com',
    passwordHash: 'admin123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-phone-id',
    name: 'Bells Admin (Phone)',
    role: 'admin',
    emailOrPhone: '0241234567',
    passwordHash: 'admin123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cashier-email-id',
    name: 'Bells Cashier',
    role: 'cashier',
    emailOrPhone: 'cashier@bells.com',
    passwordHash: 'cashier123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cashier-phone-id',
    name: 'Bells Cashier (Phone)',
    role: 'cashier',
    emailOrPhone: '0551234567',
    passwordHash: 'cashier123',
    createdAt: new Date().toISOString(),
  }
];

const initialState: State = {
  menu:             defaultMenu.filter(i => i.category === 'main'),
  addons:           defaultMenu.filter(i => i.category === 'addon'),
  orders:           [],
  cart:             [],
  currentOrder:     null,
  paymentMethod:    'cash',
  adminUnlocked:    false,
  currentUser:      null,
  staff:            initialStaff,
  pendingBundle:    null,
  storeSettings:    { isOpen: true, deliveryFee: 20, taxRate: 0 },
  _nextOrderNumber: 1,
};

// ─── Reducer ───────────────────────────────────────────────────────────────────

function appReducer(state: State, action: AppAction): State {
  switch (action.type) {

    // ── Bundle flow ──────────────────────────────────────────────────────────

    case 'START_BUNDLE':
      // Records which main + size the cashier chose.
      // AddonSheet reads state.pendingBundle to know what to display.
      return { ...state, pendingBundle: action.payload };

    case 'CONFIRM_BUNDLE': {
      const editCartItemId = state.pendingBundle?.cartItemId;
      if (editCartItemId) {
        // Editing an existing bundle in cart
        const bundle = { ...action.payload, cartItemId: editCartItemId };
        return {
          ...state,
          cart:          state.cart.map(b => b.cartItemId === editCartItemId ? bundle : b),
          pendingBundle: null,
        };
      } else {
        // Creating a new bundle in cart
        const bundle = { ...action.payload, cartItemId: crypto.randomUUID() };
        return {
          ...state,
          cart:          [...state.cart, bundle],
          pendingBundle: null,
        };
      }
    }

    case 'REMOVE_BUNDLE':
      return {
        ...state,
        cart: state.cart.filter(b => b.cartItemId !== action.payload),
      };

    case 'INCREMENT_BUNDLE_QTY':
      return {
        ...state,
        cart: state.cart.map(b =>
          b.cartItemId === action.payload
            ? { ...b, quantity: b.quantity + 1 }
            : b
        ),
      };

    case 'DECREMENT_BUNDLE_QTY':
      return {
        ...state,
        cart: state.cart.map(b =>
          b.cartItemId === action.payload && b.quantity > 1
            ? { ...b, quantity: b.quantity - 1 }
            : b
        ),
      };

    case 'UPDATE_BUNDLE_QTY': {
      const { cartItemId, quantity } = action.payload;
      return {
        ...state,
        cart: state.cart.map(b =>
          b.cartItemId === cartItemId
            ? { ...b, quantity }
            : b
        ),
      };
    }

    // ── Payment ──────────────────────────────────────────────────────────────

    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload };

    // ── Order lifecycle ──────────────────────────────────────────────────────

    case 'CONFIRM_ORDER': {
      // Total is always derived from cart bundles × their quantities — never passed in by the caller.
      const total = parseFloat(
        state.cart.reduce((sum, b) => sum + b.bundleTotal * b.quantity, 0).toFixed(2)
      );
      const status = action.payload?.status ?? 'completed';
      const paymentMethod = action.payload?.paymentMethod ?? state.paymentMethod;
      const order: Order = {
        id:            crypto.randomUUID(),
        orderNumber:   state._nextOrderNumber,
        items:         [...state.cart],
        total,
        paymentMethod,
        status,
        createdAt:     new Date().toISOString(),
      };
      return {
        ...state,
        currentOrder:     order,
        orders:           [order, ...state.orders],
        _nextOrderNumber: state._nextOrderNumber + 1,
      };
    }

    case 'COMPLETE_PENDING_ORDER': {
      const { id, paymentMethod } = action.payload;
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === id ? { ...o, status: 'completed' as const, paymentMethod } : o
        ),
      };
    }

    case 'CANCEL_PENDING_ORDER': {
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload ? { ...o, status: 'cancelled' as const } : o
        ),
      };
    }

    case 'CANCEL_ORDER':
      // Clears cart without saving — mark currentOrder cancelled if present.
      return {
        ...state,
        cart: [],
        currentOrder: state.currentOrder
          ? { ...state.currentOrder, status: 'cancelled' }
          : null,
      };

    case 'CANCEL_PENDING':
      // Dismiss AddonSheet without adding anything to the cart.
      return { ...state, pendingBundle: null };

    case 'NEW_ORDER':
      // After receipt printed / customer served — fresh slate.
      return {
        ...state,
        cart:          [],
        currentOrder:  null,
        paymentMethod: 'cash',
        pendingBundle: null,
      };

    // ── Data hydration ───────────────────────────────────────────────────────

    case 'SET_MENU':
      // Automatically derives addons array — caller just passes the full list.
      return {
        ...state,
        menu:   action.payload.filter(i => i.category === 'main'),
        addons: action.payload.filter(i => i.category === 'addon'),
      };

    case 'SET_ORDERS':
      return { ...state, orders: action.payload };

    // ── Menu management (admin) ──────────────────────────────────────────────

    case 'UPDATE_MENU_ITEM': {
      const applyUpdate = (list: MenuItem[]) =>
        list.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        );
      return {
        ...state,
        menu:   applyUpdate(state.menu),
        addons: applyUpdate(state.addons),
      };
    }

    case 'ADD_MENU_ITEM': {
      const item = action.payload;
      return {
        ...state,
        menu:   item.category === 'main'  ? [...state.menu,   item] : state.menu,
        addons: item.category === 'addon' ? [...state.addons, item] : state.addons,
      };
    }

    case 'DELETE_MENU_ITEM': {
      const filterItem = (list: MenuItem[]) => list.filter(item => item.id !== action.payload);
      return {
        ...state,
        menu:   filterItem(state.menu),
        addons: filterItem(state.addons),
      };
    }

    case 'TOGGLE_AVAILABLE': {
      const toggle = (list: MenuItem[]) =>
        list.map(item =>
          item.id === action.payload ? { ...item, available: !item.available } : item
        );
      return {
        ...state,
        menu:   toggle(state.menu),
        addons: toggle(state.addons),
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        storeSettings: { ...state.storeSettings, ...action.payload },
      };
    }

    // ── Admin auth ───────────────────────────────────────────────────────────

    case 'UNLOCK_ADMIN':
      return { ...state, adminUnlocked: true };

    case 'LOCK_ADMIN':
      return { ...state, adminUnlocked: false };

    // ── Cashier Session & Staff Management ────────────────────────────────────

    case 'LOGIN_USER':
      return { ...state, currentUser: action.payload };

    case 'LOGOUT_USER':
      return { ...state, currentUser: null, adminUnlocked: false };

    case 'ADD_STAFF':
      return { ...state, staff: [...state.staff, action.payload] };

    case 'REMOVE_STAFF':
      return { ...state, staff: state.staff.filter(u => u.id !== action.payload) };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  state:    State;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Primary hook ──────────────────────────────────────────────────────────────

/** Primary hook — use this in all components. */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() must be used inside <AppProvider>');
  return ctx;
}

/** Alias for backward compatibility. */
export const useAppContext = useApp;
