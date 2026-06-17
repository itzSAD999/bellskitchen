# Bells Kitchen — Point of Sale System
## SPEC.md v2.0 | MiStarStudio | June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Order Flow](#2-order-flow)
3. [Tech Stack](#3-tech-stack)
4. [File & Folder Structure](#4-file--folder-structure)
5. [Database Schema (Supabase)](#5-database-schema-supabase)
6. [TypeScript Interfaces](#6-typescript-interfaces)
7. [State Management](#7-state-management)
8. [Component Tree](#8-component-tree)
9. [Receipt Format](#9-receipt-format)
10. [Default Menu Data](#10-default-menu-data)
11. [Phase 1 — Core POS](#11-phase-1--core-pos)
12. [Phase 2 — Paystack Integration](#12-phase-2--paystack-integration)
13. [Phase 3 — Scale & Multi-Vendor](#13-phase-3--scale--multi-vendor)
14. [Feature List](#14-feature-list)
15. [Setup & Run](#15-setup--run)

---

## 1. Project Overview

Offline-capable React PWA Point of Sale system built specifically for **Bells Kitchen**. Supabase provides the backend — real-time database and API. The app runs on a single cashier phone (browser) and is fully manageable by the owner.

### Business Context

| Aspect | Detail |
|--------|--------|
| Client | Bells Kitchen |
| Operation | Walk-in fast food, single location |
| Device | Phone (Android/iOS browser) |
| Connectivity | Offline-capable |
| Receipt | Bluetooth 58mm thermal printer |
| Currency | Ghana Cedis (GHS / ¢) |

### User Roles

| Role | Device | Responsibility |
|------|--------|----------------|
| Cashier | Phone (browser) | Build orders, process payment, print receipt |
| Admin / Owner | Same phone | Sales dashboard, menu management |
| Prep Server | No device | Reads printed receipt, prepares food |
| Collection Staff | No device | Calls order number, hands food to customer |

### Revenue Model

| Phase | Model | Amount |
|-------|-------|--------|
| Phase 1 | Setup fee (one-time) | GHS 800 |
| Phase 1 | Monthly retainer | GHS 150/month |
| Phase 2 | 1% per order via Paystack | Auto-collected |
| Phase 3 | 1% × all vendors | Scales passively |

---

## 2. Order Flow

### Step-by-Step

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | Cashier | Taps a main dish | Size picker appears (S / M / L) |
| 2 | Cashier | Selects size | Add-ons bottom sheet slides up |
| 3 | Cashier | Selects add-ons (0 or more) | Running subtotal updates live |
| 4 | Cashier | Taps "Add to Order" | Bundle added to cart as one line item |
| 5 | Cashier | Repeats for more dishes | Same dish can appear multiple times |
| 6 | Cashier | Selects Cash or MoMo | Payment method recorded |
| 7 | Cashier | Taps Confirm Order | Order saved to Supabase, Order ID generated |
| 8 | System | Receipt screen appears | Shows all bundles + add-ons, total, Order ID |
| 9 | Cashier | Taps Print | Sends to Bluetooth thermal printer |
| 10 | Customer | Shows receipt to prep server | Server reads items + add-ons, prepares food |
| 11 | Customer | Walks to collection point | Staff calls Order ID, food collected |
| 12 | Cashier | Taps New Order | Cart cleared, ready for next customer |

### Bundle Concept

Each cart item is a **bundle** — one main dish + its chosen add-ons. The same main can appear multiple times with different add-ons. Add-ons are **never standalone**.

```
[1]  Jollof Rice (M)              ¢40
       + Big Sausage              ¢ 7
       + Egg                      ¢ 3
     Bundle total:               ¢50

[2]  Jollof Rice (M)              ¢40
       + Extra Chicken            ¢15
     Bundle total:               ¢55

[3]  Banku & Tilapia (L)          ¢70
       + Egg                      ¢ 3
     Bundle total:               ¢73

     ORDER TOTAL:               ¢178
```

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| UI Framework | React | 18 |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.x |
| Backend / DB | Supabase | Latest |
| Supabase Client | @supabase/supabase-js | 2.x |
| State Management | React Context + useReducer | - |
| Routing | React Router | v6 |
| PWA | vite-plugin-pwa | Latest |
| Icons | Lucide React | Latest |
| Print | window.print() + @media print CSS | - |
| Payments (Phase 2) | Paystack | Latest |

---

## 4. File & Folder Structure

```
bells-kitchen-pos/
├── public/
│    ├── manifest.json              # PWA manifest
│    └── icons/                     # App icons (192x192, 512x512)
├── src/
│    ├── main.tsx                   # Entry point
│    ├── App.tsx                    # Root + routing
│    │
│    ├── lib/
│    │    └── supabase.ts           # Supabase client init
│    │
│    ├── context/
│    │    └── AppContext.tsx        # Global state (orders, menu, cart)
│    │
│    ├── types/
│    │    └── index.ts              # All TypeScript interfaces
│    │
│    ├── data/
│    │    └── defaultMenu.ts        # Seed menu data (from Bells Kitchen price list)
│    │
│    ├── hooks/
│    │    ├── useMenu.ts            # Fetch + subscribe to menu_items
│    │    ├── useOrders.ts          # Fetch + subscribe to orders
│    │    └── useAdminPIN.ts        # PIN verify logic
│    │
│    ├── utils/
│    │    ├── orderUtils.ts         # Order number gen, total calc, 1% fee calc
│    │    └── salesUtils.ts         # Dashboard metric calculations
│    │
│    ├── screens/
│    │    ├── CashierScreen.tsx     # Main ordering screen
│    │    ├── AdminScreen.tsx       # Sales + menu management
│    │    └── PINGate.tsx           # PIN entry screen
│    │
│    ├── components/
│    │    ├── cashier/
│    │    │    ├── MenuGrid.tsx     # Grid of main dish cards
│    │    │    ├── MenuCard.tsx     # Single dish card (tap to start bundle)
│    │    │    ├── SizePicker.tsx   # S / M / L modal
│    │    │    ├── AddonSheet.tsx   # Add-ons bottom sheet
│    │    │    ├── AddonItem.tsx    # Single add-on checkbox row
│    │    │    ├── CartPanel.tsx    # Cart sidebar / bottom panel
│    │    │    ├── BundleItem.tsx   # One bundle row in cart
│    │    │    └── PaymentToggle.tsx
│    │    │
│    │    ├── receipt/
│    │    │    ├── ReceiptModal.tsx # Full-screen receipt overlay
│    │    │    └── ReceiptView.tsx  # 58mm formatted receipt
│    │    │
│    │    └── admin/
│    │         ├── SalesDashboard.tsx
│    │         ├── RevenueCard.tsx
│    │         ├── PaymentSplit.tsx
│    │         ├── TopItems.tsx
│    │         ├── OrderHistory.tsx
│    │         ├── MenuManagement.tsx
│    │         ├── MenuItemRow.tsx
│    │         └── AddItemForm.tsx
│    │
│    └── styles/
│         ├── index.css             # Tailwind directives
│         └── print.css             # @media print receipt styles
│
├── .env.local                      # Supabase keys (never commit)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 5. Database Schema (Supabase)

### Tables Overview

| Table | Purpose |
|-------|---------|
| `menu_items` | Full menu catalog (mains + addons) |
| `orders` | Order headers |
| `order_items` | One main dish bundle per order |
| `order_item_addons` | Add-ons attached to a bundle |
| `settings` | App config (PIN, business name, order counter) |

---

### 5.1 menu_items

```sql
create table menu_items (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null check (category in ('main', 'addon')),
  has_sizes    boolean not null default false,
  price_s      numeric(10,2),   -- Small  (null if no sizes)
  price_m      numeric(10,2),   -- Medium (null if no sizes)
  price_l      numeric(10,2),   -- Large  (null if no sizes)
  price_fixed  numeric(10,2),   -- Fixed price for addons
  available    boolean not null default true,
  sort_order   integer default 0,
  created_at   timestamptz default now()
);
```

### 5.2 orders

```sql
create table orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   integer not null,
  total          numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cash', 'momo', 'card')),
  status         text not null default 'completed'
                   check (status in ('completed', 'cancelled')),
  -- Phase 2: Paystack fields
  paystack_ref       text,
  platform_fee       numeric(10,2) default 0,   -- 1% cut (Phase 2)
  vendor_amount      numeric(10,2),              -- total minus 1% (Phase 2)
  created_at     timestamptz default now()
);
```

### 5.3 order_items

```sql
create table order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  menu_item_id   uuid not null references menu_items(id),
  name           text not null,         -- Snapshot at time of order
  size           text check (size in ('S', 'M', 'L')),
  base_price     numeric(10,2) not null,
  bundle_total   numeric(10,2) not null, -- base_price + all addons
  created_at     timestamptz default now()
);
```

### 5.4 order_item_addons

```sql
create table order_item_addons (
  id              uuid primary key default gen_random_uuid(),
  order_item_id   uuid not null references order_items(id) on delete cascade,
  menu_item_id    uuid not null references menu_items(id),
  name            text not null,        -- Snapshot at time of order
  price           numeric(10,2) not null
);
```

### 5.5 settings

```sql
create table settings (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text not null default 'Bells Kitchen',
  admin_pin           text not null default '0000',
  next_order_number   integer not null default 1,
  -- Phase 2
  paystack_public_key text,
  platform_fee_pct    numeric(5,4) default 0.01  -- 1%
);
-- Always one row only
```

### 5.6 Indexes

```sql
create index idx_orders_created_at      on orders(created_at);
create index idx_order_items_order_id   on order_items(order_id);
create index idx_addons_order_item_id   on order_item_addons(order_item_id);
create index idx_menu_category          on menu_items(category, sort_order);
```

### 5.7 Row Level Security

```sql
alter table menu_items        enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table order_item_addons enable row level security;
alter table settings          enable row level security;

-- Allow all operations via anon key (app controls access via PIN)
create policy "allow_all" on menu_items        for all using (true);
create policy "allow_all" on orders            for all using (true);
create policy "allow_all" on order_items       for all using (true);
create policy "allow_all" on order_item_addons for all using (true);
create policy "allow_all" on settings          for all using (true);
```

---

## 6. TypeScript Interfaces

```typescript
// types/index.ts

export interface MenuItem {
  id:          string;
  name:        string;
  category:    'main' | 'addon';
  hasSizes:    boolean;
  prices: {
    S?:        number;
    M?:        number;
    L?:        number;
    fixed?:    number;
  };
  available:   boolean;
  sortOrder:   number;
}

export interface AddOn {
  menuItemId:  string;
  name:        string;
  price:       number;
}

export interface BundleItem {
  cartItemId:  string;          // uuid — unique per bundle in cart
  menuItemId:  string;
  name:        string;
  size:        'S' | 'M' | 'L';
  basePrice:   number;
  addons:      AddOn[];         // 0 or more, never standalone
  bundleTotal: number;          // basePrice + sum(addon.price)
}

export interface Order {
  id:            string;
  orderNumber:   number;
  items:         BundleItem[];
  total:         number;
  paymentMethod: 'cash' | 'momo' | 'card';
  status:        'completed' | 'cancelled';
  paystackRef?:  string;        // Phase 2
  platformFee?:  number;        // Phase 2 — 1% cut
  vendorAmount?: number;        // Phase 2 — total minus 1%
  createdAt:     string;
}

export interface AppSettings {
  businessName:      string;
  adminPIN:          string;
  nextOrderNumber:   number;
  paystackPublicKey?: string;   // Phase 2
  platformFeePct?:   number;    // Phase 2 — default 0.01 (1%)
}

export interface AppState {
  menu:          MenuItem[];
  addons:        MenuItem[];    // filtered: category === 'addon'
  orders:        Order[];
  cart:          BundleItem[];  // session only, never persisted
  currentOrder:  Order | null;
  paymentMethod: 'cash' | 'momo' | 'card';
  adminUnlocked: boolean;
}
```

---

## 7. State Management

### Reducer Actions

| Action | Payload | Effect |
|--------|---------|--------|
| `START_BUNDLE` | menuItemId + size | Opens AddonSheet with pre-selected main |
| `CONFIRM_BUNDLE` | BundleItem | Appends bundle to cart |
| `REMOVE_BUNDLE` | cartItemId | Removes bundle from cart |
| `SET_PAYMENT` | 'cash' \| 'momo' \| 'card' | Sets payment method |
| `CONFIRM_ORDER` | none | Saves to Supabase, sets currentOrder |
| `CANCEL_ORDER` | none | Clears cart, no DB write |
| `NEW_ORDER` | none | Clears cart + currentOrder |
| `SET_MENU` | MenuItem[] | Hydrates menu from Supabase |
| `SET_ORDERS` | Order[] | Hydrates orders from Supabase |
| `UPDATE_MENU_ITEM` | Partial\<MenuItem\> | Updates item in state + Supabase |
| `ADD_MENU_ITEM` | MenuItem | Appends to menu + Supabase |
| `TOGGLE_AVAILABLE` | menuItemId | Flips available flag |
| `UNLOCK_ADMIN` | none | Sets adminUnlocked = true |
| `LOCK_ADMIN` | none | Sets adminUnlocked = false |

---

## 8. Component Tree

```
<App>
 ├── <AppContext.Provider>
 ├── <CashierScreen>
 │    ├── <MenuGrid>               mains only (category='main')
 │    │    └── <MenuCard>          tap → START_BUNDLE
 │    ├── <SizePicker>             modal: S / M / L
 │    ├── <AddonSheet>             bottom sheet after size selected
 │    │    └── <AddonItem>         checkbox row per addon
 │    ├── <CartPanel>
 │    │    ├── <BundleItem>        shows main + indented addons
 │    │    └── <PaymentToggle>     Cash / MoMo
 │    └── <ReceiptModal>           appears after CONFIRM_ORDER
 │         ├── <ReceiptView>       58mm formatted
 │         ├── Print button
 │         ├── Cancel Order button
 │         └── New Order button
 │
 └── <AdminScreen>                 PIN-gated
      ├── <PINGate>
      ├── Tab: Sales
      │    ├── <DateFilter>
      │    ├── <RevenueCard>
      │    ├── <PaymentSplit>
      │    ├── <TopItems>
      │    └── <OrderHistory>
      └── Tab: Menu
           ├── <MenuItemList>
           │    └── <MenuItemRow>  edit price, toggle available
           └── <AddItemForm>
```

---

## 9. Receipt Format (58mm Thermal)

```
================================
          BELLS KITCHEN
================================
Order #: 0047
Date: 17/06/26   Time: 1:03 PM
--------------------------------
Jollof Rice (M)         ¢40.00
  + Big Sausage          ¢7.00
  + Egg                  ¢3.00
  Subtotal:             ¢50.00

Jollof Rice (M)         ¢40.00
  + Extra Chicken       ¢15.00
  Subtotal:             ¢55.00

Banku & Tilapia (L)     ¢70.00
  + Egg                  ¢3.00
  Subtotal:             ¢73.00
--------------------------------
TOTAL:                 ¢178.00
Payment: CASH
--------------------------------
    Thank you! Come again :)
================================
```

### Print CSS

```css
@media print {
  body > * { display: none; }
  .receipt-view { display: block !important; }
  .receipt-view {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    width: 58mm;
    margin: 0;
    padding: 4mm;
  }
}
```

---

## 10. Default Menu Data

```typescript
// data/defaultMenu.ts

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
```

---

## 11. Phase 1 — Core POS

> **Goal:** Working POS system for Bells Kitchen. Cash + MoMo (manual). Receipt prints. Sales tracked.
> **Revenue:** GHS 800 setup fee + GHS 150/month retainer.

### What to Build

- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Supabase project created, schema from Section 5 applied
- [ ] Supabase client configured (`lib/supabase.ts`)
- [ ] Default menu seeded into `menu_items` table
- [ ] TypeScript interfaces (`types/index.ts`)
- [ ] AppContext + useReducer wired up
- [ ] `useMenu` hook — fetch menu from Supabase on mount
- [ ] `useOrders` hook — fetch orders from Supabase on mount

**Cashier Screen**
- [ ] `MenuGrid` — shows only mains, category tabs (Mains)
- [ ] `MenuCard` — tap to trigger `START_BUNDLE`
- [ ] `SizePicker` modal — S / M / L with prices shown
- [ ] `AddonSheet` — bottom sheet with all available addons as checkboxes
- [ ] `AddonItem` — checkbox row with name + price
- [ ] `CartPanel` — live cart, running total
- [ ] `BundleItem` — main dish row + indented addons
- [ ] `PaymentToggle` — Cash / MoMo
- [ ] Confirm Order button — saves to Supabase

**Receipt**
- [ ] `ReceiptModal` — full screen overlay
- [ ] `ReceiptView` — formatted for 58mm thermal (Bells Kitchen header)
- [ ] Print button (`window.print()`)
- [ ] Cancel Order button (voids order)
- [ ] New Order button (clears cart)

**Admin Screen**
- [ ] `PINGate` — 4-digit PIN entry
- [ ] `SalesDashboard` — today's revenue, order count, cash vs MoMo
- [ ] `RevenueCard` — total GHS
- [ ] `PaymentSplit` — cash vs MoMo bar
- [ ] `TopItems` — best sellers ranked
- [ ] `OrderHistory` — full transaction list
- [ ] `DateFilter` — today / this week / this month
- [ ] `MenuManagement` tab
- [ ] `MenuItemRow` — edit price, toggle available
- [ ] `AddItemForm` — add new item (name, category, sizes, prices)

**PWA**
- [ ] `vite-plugin-pwa` configured
- [ ] `manifest.json` with Bells Kitchen name + icons
- [ ] Add to Home Screen works on Android + iOS

### Key Queries (Phase 1)

```typescript
// Save order
const saveOrder = async (cart: BundleItem[], total: number, paymentMethod: string) => {
  // 1. Get + increment order number
  const { data: s } = await supabase
    .from('settings').select('*').single();
  const orderNumber = s.next_order_number;
  await supabase.from('settings')
    .update({ next_order_number: orderNumber + 1 }).eq('id', s.id);

  // 2. Insert order header
  const { data: order } = await supabase.from('orders').insert({
    order_number: orderNumber,
    total,
    payment_method: paymentMethod,
    status: 'completed'
  }).select().single();

  // 3. Insert bundles + addons
  for (const bundle of cart) {
    const { data: item } = await supabase.from('order_items').insert({
      order_id: order.id,
      menu_item_id: bundle.menuItemId,
      name: bundle.name,
      size: bundle.size,
      base_price: bundle.basePrice,
      bundle_total: bundle.bundleTotal
    }).select().single();

    if (bundle.addons.length > 0) {
      await supabase.from('order_item_addons').insert(
        bundle.addons.map(a => ({
          order_item_id: item.id,
          menu_item_id: a.menuItemId,
          name: a.name,
          price: a.price
        }))
      );
    }
  }
  return order;
};

// Fetch orders with full detail
const fetchOrders = async (startDate: string, endDate: string) => {
  const { data } = await supabase
    .from('orders')
    .select(`*, order_items(*, order_item_addons(*))`)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });
  return data;
};
```

---

## 12. Phase 2 — Paystack Integration

> **Goal:** Customers pay through the app. 1% platform fee auto-collected by MiStarStudio.
> **Revenue:** 1% of every order at Bells Kitchen, automatically via Paystack split.

### What Changes

- [ ] Add Paystack public key to `settings` table
- [ ] Add `paystack_ref`, `platform_fee`, `vendor_amount` to `orders` table (already in schema)
- [ ] `PaymentToggle` gains a **Card/MoMo (Pay Now)** option
- [ ] On confirm → initialize Paystack transaction
- [ ] Paystack popup opens on customer's phone
- [ ] On success → save order with `paystack_ref`
- [ ] 1% split calculated: `platformFee = total * 0.01`
- [ ] Admin dashboard gains: **Platform Fee Earned** metric
- [ ] `orderUtils.ts` — add `calculatePlatformFee(total: number)` helper

### Paystack Split Logic

```typescript
// utils/orderUtils.ts

export const calculatePlatformFee = (total: number, feePct = 0.01) => {
  const platformFee = parseFloat((total * feePct).toFixed(2));
  const vendorAmount = parseFloat((total - platformFee).toFixed(2));
  return { platformFee, vendorAmount };
};

// Initialize Paystack
export const initializePaystack = (total: number, email: string, ref: string) => {
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email,
    amount: total * 100, // Paystack uses kobo/pesewas
    currency: 'GHS',
    ref,
    onSuccess: (transaction) => {
      // Save order with paystack_ref
    },
    onCancel: () => {
      // Handle cancel
    }
  });
  handler.openIframe();
};
```

### New .env.local keys (Phase 2)

```
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
```

### Receipt Update (Phase 2)

```
--------------------------------
TOTAL:                 ¢178.00
Payment: MOMO (Paystack)
Ref: PAY_abc123xyz
--------------------------------
```

---

## 13. Phase 3 — Scale & Multi-Vendor

> **Goal:** Onboard more food vendors. Same codebase, new Supabase project per vendor.
> **Revenue:** GHS 800 setup + GHS 150/month + 1% per order × all vendors.

### What Changes

- [ ] Create a **vendor onboarding checklist** (new Supabase project, seed menu, brand receipt)
- [ ] Extract all Bells Kitchen branding into `.env.local` vars
  ```
  VITE_BUSINESS_NAME=Bells Kitchen
  VITE_RECEIPT_FOOTER=Thank you! Come again :)
  ```
- [ ] Build a simple **Admin onboarding script** to seed a new vendor's menu
- [ ] Track all vendors in a **MiStarStudio master dashboard** (separate Supabase project)
  - Vendors list
  - Monthly revenue per vendor
  - Total platform fees collected
- [ ] Consider multi-tenant architecture if vendor count exceeds 10

### Revenue Projection

```
1 vendor  (100 orders/day @ ¢35 avg):  ¢1,050/month
5 vendors:                              ¢5,250/month
10 vendors:                            ¢10,500/month
+ retainers (10 × ¢150):              ¢1,500/month
─────────────────────────────────────────────────────
10 vendors total:                      ¢12,000/month
```

---

## 14. Feature List

| Feature | Screen | Phase |
|---------|--------|-------|
| Tap main dish to start bundle | Cashier | 1 |
| Size picker (S / M / L) | Cashier | 1 |
| Add-ons bottom sheet per bundle | Cashier | 1 |
| Same main dish orderable multiple times | Cashier | 1 |
| Add-ons only attach to mains, never standalone | Cashier | 1 |
| Remove a bundle from cart | Cashier | 1 |
| Cash / MoMo payment toggle | Cashier | 1 |
| Confirm order → saved to Supabase | Cashier | 1 |
| Cancel order (void before print) | Cashier | 1 |
| Receipt with bundles + add-ons | Receipt | 1 |
| Print receipt via Bluetooth thermal | Receipt | 1 |
| New Order clears cart | Receipt | 1 |
| PIN-protected admin access | Admin | 1 |
| Daily sales dashboard | Admin | 1 |
| Cash vs MoMo breakdown | Admin | 1 |
| Top selling items | Admin | 1 |
| Full order history list | Admin | 1 |
| Date filter on dashboard | Admin | 1 |
| Edit menu item price | Admin | 1 |
| Add new menu item | Admin | 1 |
| Toggle item availability (sold out) | Admin | 1 |
| Offline support via PWA | App | 1 |
| Paystack payment (Card + MoMo) | Cashier | 2 |
| 1% platform fee auto-collected | System | 2 |
| Platform fee metric in admin | Admin | 2 |
| Multi-vendor master dashboard | MiStarStudio | 3 |
| Vendor onboarding script | MiStarStudio | 3 |

---

## 15. Setup & Run

### Install

```bash
npm create vite@latest bells-kitchen-pos -- --template react-ts
cd bells-kitchen-pos
npm install
npm install @supabase/supabase-js react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p
```

### Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Phase 2 only
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
```

### Database

1. Create project at [supabase.com](https://supabase.com)
2. Open SQL Editor
3. Run all SQL from **Section 5** above
4. Seed default menu from **Section 10**

### Run

```bash
npm run dev       # Development
npm run build     # Production build
npm run preview   # Preview production build
```

### Install on Phone

1. Open app URL in Chrome (Android) or Safari (iOS)
2. Chrome: tap menu → "Add to Home Screen"
3. Safari: tap Share → "Add to Home Screen"
4. App runs like a native app with offline support

---

*Bells Kitchen POS — SPEC.md v2.0 | Built by MiStarStudio | June 2026*
