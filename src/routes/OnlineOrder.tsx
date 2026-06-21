import React, { useState, useRef, useEffect } from 'react';
import { Truck, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MenuItem, BundleItem, AddOn } from '../types';
import { supabase } from '../lib/supabase';
import CounterHeader from '../components/online-order/CounterHeader';
import DishGrid from '../components/online-order/DishGrid';
import BundleBuilder from '../components/online-order/BundleBuilder';
import TrayDrawer from '../components/online-order/TrayDrawer';
import ConfirmationModal from '../components/online-order/ConfirmationModal';
import FlyingItem from '../components/online-order/FlyingItem';
import { useFlyAnimation } from '../hooks/useFlyAnimation';
import { usePaystackCheckout } from '../hooks/usePaystackCheckout';

export default function OnlineOrder() {
  const { state } = useApp();
  const [cart, setCart] = useState<BundleItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isTrayOpen, setIsTrayOpen] = useState(true);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [orderMethod, setOrderMethod] = useState<'delivery'|'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'online'|'cash'>('online');
  const [confirmedOrderNum, setConfirmedOrderNum] = useState<number | null>(null);
  
  const { animations, triggerFly } = useFlyAnimation();
  const trayIconRef = useRef<HTMLButtonElement>(null);
  
  // Track cart item count pulse
  const [isTrayPulsing, setIsTrayPulsing] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (item.bundleTotal * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenBundleBuilder = (item: MenuItem, _element: HTMLElement) => {
    setSelectedDish(item);
    setIsTrayOpen(true); // Ensure sidebar is open when customizing
  };

  const handleConfirmBundle = (item: MenuItem, size: 'S'|'M'|'L', addons: AddOn[], instructions: string, qty: number, btnRect: DOMRect) => {
    // Start fly animation
    if (trayIconRef.current) {
      const trayRect = trayIconRef.current.getBoundingClientRect();
      triggerFly(btnRect, trayRect, '🍲');
    }
    
    setSelectedDish(null);

    // Add to cart after delay so count increments when item lands
    setTimeout(() => {
      const basePrice = item.hasSizes ? (item.prices[size] || 0) : (item.prices.fixed || 0);
      const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
      
      const newItem: BundleItem = {
        cartItemId: crypto.randomUUID(),
        menuItemId: item.id,
        name: item.name,
        size: item.hasSizes ? size : 'M',
        basePrice,
        addons,
        instructions,
        imageUrl: item.imageUrl,
        bundleTotal: basePrice + addonsTotal,
        quantity: qty
      };
      
      setCart(prev => [...prev, newItem]);
      
      // pulse tray
      setIsTrayPulsing(true);
      setTimeout(() => setIsTrayPulsing(false), 300);
    }, 500); // Wait 500ms for fly animation to land
  };

  const handleUpdateQty = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleCheckoutSuccess = async (reference: any) => {
    setIsTrayOpen(false);
    
    // Save to supabase using relational tables
    try {
      const { data: settings } = await supabase.from('settings').select('next_order_number').single();
      const nextNum = settings?.next_order_number || 1;
      const orderId = crypto.randomUUID();
      
      const newOrder = {
        id: orderId,
        order_number: nextNum,
        total: cartTotal,
        payment_method: 'card',
        status: 'completed',
        source: 'online',
        printed: false,
        paystack_ref: reference.reference,
        created_at: new Date().toISOString()
      };
      
      // 1. Insert order header
      const { error: orderError } = await supabase.from('orders').insert(newOrder);
      if (orderError) throw orderError;

      // 2. Insert items and addons
      for (const bundle of cart) {
        const { error: itemError } = await supabase.from('order_items').insert({
          id: bundle.cartItemId,
          order_id: orderId,
          menu_item_id: bundle.menuItemId,
          name: bundle.name,
          size: bundle.size,
          base_price: bundle.basePrice,
          bundle_total: bundle.bundleTotal,
          created_at: newOrder.created_at
        });
        if (itemError) throw itemError;

        if (bundle.addons && bundle.addons.length > 0) {
          const { error: addonsError } = await supabase.from('order_item_addons').insert(
            bundle.addons.map(a => ({
              order_item_id: bundle.cartItemId,
              menu_item_id: a.menuItemId,
              name: a.name,
              price: a.price
            }))
          );
          if (addonsError) throw addonsError;
        }
      }

      await supabase.from('settings').update({ next_order_number: nextNum + 1 }).eq('id', 1);
      
      setCart([]);
      setConfirmedOrderNum(nextNum);
    } catch (error) {
      console.error('Error saving order', error);
      alert('Order paid but failed to save. Please show your receipt at the counter.');
    }
  };

  const { startCheckout } = usePaystackCheckout(
    cartTotal, 
    '', 
    handleCheckoutSuccess, 
    () => console.log('Checkout closed')
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      
      <CounterHeader 
        cartItemCount={cartItemCount}
        onOpenTray={() => setIsTrayOpen(prev => !prev)}
        trayIconRef={trayIconRef}
        isTrayPulsing={isTrayPulsing}
      />

      <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/food.png')] bg-[#FBEFE3]/30 flex relative">
        
        {/* Desktop Sidebar Navigation Container (Perfectly Fixed) */}
        <div className="hidden lg:flex fixed left-0 top-[72px] bottom-0 w-72 bg-white/90 backdrop-blur-xl border-r border-[#d97706]/20 shadow-[10px_0_30px_rgba(0,0,0,0.03)] z-30 flex-col pt-8 pb-10">
           <div className="flex-1 overflow-y-auto px-8 hide-scrollbar">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-8 h-8 bg-[#431407] rounded-lg flex items-center justify-center transform -rotate-6">
                 <span className="text-white font-black text-xs">BK</span>
               </div>
               <h3 className="text-xs font-black text-[#d97706] uppercase tracking-[0.2em]">Menu</h3>
             </div>
             <ul className="space-y-3">
               <li><a href="#jollof" className="flex items-center justify-between p-4 rounded-2xl bg-[#431407] text-white font-black hover:bg-[#2a0e05] hover:scale-105 transition-all shadow-md"><span>Bells Jollof</span><span className="text-amber-500 text-lg leading-none">›</span></a></li>
               <li><a href="#fried-rice" className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-transparent hover:border-[#d97706]/30 font-black text-[#431407] hover:bg-amber-50 hover:scale-105 transition-all"><span>Fried Rice</span><span className="text-gray-300 text-lg leading-none">›</span></a></li>
               <li><a href="#banku" className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-transparent hover:border-[#d97706]/30 font-black text-[#431407] hover:bg-amber-50 hover:scale-105 transition-all"><span>Bells Banku</span><span className="text-gray-300 text-lg leading-none">›</span></a></li>
               <li><a href="#others" className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-transparent hover:border-[#d97706]/30 font-black text-[#431407] hover:bg-amber-50 hover:scale-105 transition-all"><span>More Mains</span><span className="text-gray-300 text-lg leading-none">›</span></a></li>
             </ul>
           </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 px-4 sm:px-8 max-w-6xl lg:ml-72 pt-8 pb-24 transition-all duration-300`}>
          {checkoutMode ? (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto mt-4 mb-24">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Checkout Details</h2>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">Complete your order securely</p>
              
              <div className="space-y-6">
                {/* Method Selection */}
                <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] w-full mb-6 border border-gray-200 shadow-inner">
                  <button onClick={() => setOrderMethod('delivery')} className={`flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${orderMethod === 'delivery' ? 'bg-[#d97706] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                    <Truck size={16} strokeWidth={2.5} /> Delivery
                  </button>
                  <button onClick={() => setOrderMethod('pickup')} className={`flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${orderMethod === 'pickup' ? 'bg-[#d97706] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                    <Store size={16} strokeWidth={2.5} /> Pickup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Your Full Name *</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Phone Number *</label>
                    <input type="tel" className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner" placeholder="054 000 0000" />
                  </div>
                </div>

                {orderMethod === 'delivery' && (
                  <div className="space-y-1.5 animate-scale-in">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Delivery Address / Hostel *</label>
                    <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-inner resize-none" placeholder="e.g. No Weapon Hostel Annex, Room 24..." />
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-3">Payment Method</label>
                  <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] w-full mb-6 border border-gray-200 shadow-inner">
                    <button onClick={() => setPaymentMethod('online')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${paymentMethod === 'online' ? 'bg-[#25D366] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                      Card / MoMo
                    </button>
                    <button onClick={() => setPaymentMethod('cash')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${paymentMethod === 'cash' ? 'bg-[#d97706] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                      {orderMethod === 'delivery' ? 'Pay on Delivery' : 'Pay on Pickup'}
                    </button>
                  </div>

                  <button onClick={() => {
                    if (paymentMethod === 'online') {
                      startCheckout();
                    } else {
                      handleCheckoutSuccess({ reference: 'CASH-' + crypto.randomUUID().split('-')[0] });
                    }
                  }} className="w-full py-4 bg-gradient-to-r from-[#d97706] to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Complete Order — GH₵{cartTotal.toFixed(2)}
                  </button>
                  <button onClick={() => setCheckoutMode(false)} className="w-full mt-4 py-4 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full font-black text-xs uppercase tracking-widest transition-all">
                    ← Back to Menu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <DishGrid 
              items={state.menu} 
              onSelectDish={handleOpenBundleBuilder} 
            />
          )}
        </div>

        {/* Right Sidebar Wrapper for Desktop */}
        {(!checkoutMode && isTrayOpen) && (
          <div className="hidden xl:block w-96 shrink-0 border-l border-[#d97706]/10 bg-white/90 backdrop-blur-xl shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-30 relative">
            <BundleBuilder 
              item={selectedDish} 
              onClose={() => setSelectedDish(null)} 
              onConfirm={handleConfirmBundle} 
            />
            <TrayDrawer 
              isOpen={isTrayOpen} 
              hideOnDesktop={!!selectedDish}
              onClose={() => setIsTrayOpen(false)} 
              cart={cart}
              menu={state.menu}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemoveItem}
              onCheckout={() => {
                setIsTrayOpen(false);
                setCheckoutMode(true);
              }}
              onQuickAdd={(item) => {
                setSelectedDish(item);
                setIsTrayOpen(true);
              }}
            />
          </div>
        )}

      </div>

      {confirmedOrderNum && (
        <ConfirmationModal 
          orderNumber={confirmedOrderNum} 
          onClose={() => setConfirmedOrderNum(null)} 
        />
      )}

      {animations.map(task => (
        <FlyingItem key={task.id} task={task} />
      ))}
    </div>
  );
}
