import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home, Menu as MenuIcon, Store, Users, FileText, User, ChevronLeft, ChevronRight,
  MapPin, Search, ArrowUpRight, Flame, Plus, Minus, Trash2, X, ShoppingBag, Send,
  Mail, ArrowRight, Star, Quote, MessageCircle, HelpCircle, ChevronDown, Sparkles
} from 'lucide-react';

import { bgPatternUrl, bgPatternBrownUrl } from '../utils/bgPattern';

/* ─── Faint Background Pattern ─── */
const bgPattern = bgPatternUrl;

/* ─── Mock Data ─── */
const landingMenu = [
  { id: 'item_002', name: 'Jollof Rice', category: 'jollof', description: 'Rich, traditional party-style Jollof rice cooked in a seasoned, aromatic tomato and pepper broth. Forget the mediocre versions. This is Proper Jollof that is perfectly seasoned.', price: 'GH₵ 40.00', prices: { S: 35, M: 40, L: 45 }, imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=800', available: true, hasSizes: true },
  { id: 'item_006', name: 'Asorted Jollof', category: 'jollof', description: 'Famous party Jollof tossed with sliced beef, diced chicken, and sausages for a loaded Ghanaian classic.', price: 'GH₵ 65.00', prices: { S: 60, M: 65, L: 70 }, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800', available: true, hasSizes: true },
  
  { id: 'item_001', name: 'Fried Rice', category: 'fried', description: 'Savory wok-fired Fried Rice tossed with fresh carrots, green peas, spring onions, and local spices. We reject mediocrity.', price: 'GH₵ 40.00', prices: { S: 35, M: 40, L: 45 }, imageUrl: 'https://images.unsplash.com/photo-1603133872878-685f5888a3e1?auto=format&fit=crop&q=80&w=800', available: true, hasSizes: true },
  { id: 'item_005', name: 'Asorted Fried Rice', category: 'fried', description: 'Rich and hearty wok-fired Fried Rice loaded with tender beef, chicken, sausages, and fresh vegetables.', price: 'GH₵ 65.00', prices: { S: 60, M: 65, L: 70 }, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800', available: true, hasSizes: true },
  { id: 'item_003', name: 'Mixture', category: 'fried', description: 'The perfect half-and-half combination! Equal parts signature Jollof Rice and savory Fried Rice.', price: 'GH₵ 40.00', prices: { S: 35, M: 40, L: 45 }, imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800', available: true, hasSizes: true },

  { id: 'item_004', name: 'Banku & Tilapia', category: 'banku', description: 'Freshly grilled whole Tilapia seasoned with local herbs, served with hot fermented banku and our signature pepper sauce.', price: 'GH₵ 65.00', prices: { S: 60, M: 65, L: 70 }, imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800', available: true, hasSizes: true },
];

const publicAddonOptions = [
  { id: 'item_010', name: 'Extra Chicken', price: 15 },
  { id: 'item_011', name: 'Egg', price: 3 },
  { id: 'item_008', name: 'Big Sausage', price: 7 },
  { id: 'item_007', name: 'Ripe Plantain (Kokoo)', price: 1 },
];

const reviews = [
  { id: 1, name: 'Kofi Mensah', role: 'Local Foodie', text: 'Best Jollof in Kumasi. The chicken is always tender and the packaging is top notch!', rating: 5 },
  { id: 2, name: 'Ama Serwaa', role: 'Event Planner', text: 'Their Banku and Tilapia is authentic. Highly recommended for weekend cravings.', rating: 5 },
  { id: 3, name: 'Yaw Osei', role: 'Regular Customer', text: 'Always on time and the food is piping hot. The assorted fried rice is my go-to.', rating: 4 },
];

const faqs = [
  { id: 1, q: 'Do you offer delivery?', a: 'Yes! We deliver across Kumasi. Delivery fees vary by location and distance from our branches.' },
  { id: 2, q: 'Can I order for a large party?', a: 'Absolutely. We handle bulk orders and catering for all kinds of events. Please contact us 24 hours prior.' },
  { id: 3, q: 'What payment methods do you accept?', a: 'We accept Mobile Money (MTN, Vodafone, AT) and Cash on Delivery.' },
];

/* ─── Components ─── */

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-full ${active ? 'bg-[#d97706] text-white shadow-lg scale-105' : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'}`}>
    {React.cloneElement(icon as React.ReactElement, { size: 18 })}
    {label}
  </button>
);

const CategorySlider = ({ categoryName, items, isOpen, onOrder, disableScrollSpy = false }: { categoryName: string, items: any[], isOpen: boolean, onOrder: (item: any) => void, disableScrollSpy?: boolean }) => {
  const [index, setIndex] = useState(0);
  const featured = items[index];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disableScrollSpy) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const viewportCenter = viewHeight / 2;

      // Check if the container is currently intersecting the center area of viewport
      if (rect.top < viewHeight && rect.bottom > 0) {
        // Calculate progress as the element crosses the viewport center
        const relativeScroll = viewportCenter - rect.top;
        const progress = Math.max(0, Math.min(0.99, relativeScroll / rect.height));
        const newIndex = Math.floor(progress * items.length);
        if (newIndex >= 0 && newIndex < items.length) {
          setIndex(newIndex);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial run
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length, disableScrollSpy]);

  if (!featured) return null;

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 items-center border-t border-gray-200/50 mt-8">
      {/* Brand Identity */}
      <div className="w-full lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left pt-10">
        <div className="flex items-center gap-6">
          <div className="bg-[#431407] text-white rounded-[2rem] w-32 h-32 flex flex-col items-center justify-center -rotate-[10deg] shadow-[0_15px_30px_rgba(67,20,7,0.3)] border-4 border-white transform transition hover:rotate-0 hover:scale-105 duration-300">
             <div className="w-12 h-6 bg-white/20 rounded-md mb-2 flex items-center justify-center"><Flame size={16} className="text-white"/></div>
             <span className="font-black text-xs text-center leading-tight">BELLS<br/>{categoryName.split(' ')[0]}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">CATEGORY</span>
            <h2 className="text-2xl font-black text-gray-800 leading-none tracking-tight">{categoryName.toUpperCase()}</h2>
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-[#431407] mt-1" />
          </div>
        </div>
        <h2 className="text-[2.75rem] font-black mt-12 italic text-[#343a40] tracking-tighter leading-none">Bells {categoryName}</h2>
      </div>

      {/* Slider */}
      <div className="w-full lg:w-[65%]">
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group bg-amber-100 aspect-[21/9]">
          <img src={featured.imageUrl || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800"} alt={featured.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer" onClick={() => { if(isOpen && featured.available) onOrder(featured); }} />
          {!featured.available && (
             <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                <span className="bg-red-500 text-white font-black px-6 py-2 rounded-full uppercase tracking-widest text-sm shadow-xl">Sold Out</span>
             </div>
          )}
          <button onClick={() => setIndex((p) => (p > 0 ? p - 1 : items.length - 1))} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-30"><ChevronLeft size={24}/></button>
          <button onClick={() => setIndex((p) => (p < items.length - 1 ? p + 1 : 0))} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-30"><ChevronRight size={24}/></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {items.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-[#d97706]' : 'w-2 bg-white/60 hover:bg-white'}`} />
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start max-w-2xl">
          <h3 className="text-3xl font-black text-[#d97706] italic flex items-center gap-2 tracking-tight">
            {featured.name} <ArrowUpRight size={20} strokeWidth={3} />
          </h3>
          <p className="text-[#6c757d] mt-4 leading-relaxed font-semibold text-[15px]">
            {featured.hasSizes ? 'Available in multiple sizes. Customize your order to perfection.' : 'Standard portion size. Perfect for a hearty meal.'}
          </p>
          <div className="flex items-center gap-6 mt-6">
             <button disabled={!featured.available || !isOpen} onClick={() => onOrder(featured)} className="bg-[#d97706] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-sm tracking-wider py-3.5 px-10 rounded-full shadow-[0_10px_20px_rgba(217,119,6,0.25)] hover:bg-[#b45309] hover:-translate-y-0.5 active:translate-y-0 transition-all">
               {isOpen ? 'ORDER NOW' : 'CLOSED'}
             </button>
             <span className="text-2xl font-black text-gray-900">¢{featured.hasSizes ? (featured.prices.M || featured.prices.S) : featured.prices.fixed}</span>
          </div>
        </div>

        <div className="mt-16 pt-4 border-t border-gray-200/60">
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 hide-scrollbar">
            {items.map((item, i) => (
              <div key={item.id} onClick={() => {
                if (i === index) {
                  if (isOpen && item.available) onOrder(item);
                } else {
                  setIndex(i);
                }
              }} className="flex flex-col items-center flex-shrink-0 w-36 cursor-pointer group hover:scale-110 transition-transform duration-300">
                <img src={item.imageUrl || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800"} alt={item.name} className={`w-[110px] h-[110px] rounded-full object-cover shadow-lg border-[5px] transition-all duration-300 group-hover:shadow-2xl ${i === index ? 'border-[#d97706]' : 'border-white'} ${!item.available ? 'opacity-50 grayscale' : ''}`} />
                <div className={`text-white text-[10px] font-black py-3 px-3 rounded-2xl mt-[-15px] z-10 shadow-md text-center italic w-full uppercase tracking-wider transition-colors line-clamp-1 ${i === index ? 'bg-[#d97706]' : 'bg-[#431407] group-hover:bg-[#2a0e05]'}`}>
                   {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LandingScreen() {
  const { state, dispatch } = useApp();

  /* ── View State ── */
  const [view, setView] = useState<'home' | 'menu'>('home');

  /* ── Order/Cart State ── */
  const [publicCart, setPublicCart] = useState<any[]>([]);
  const [isPublicCartOpen, setIsPublicCartOpen] = useState(false);
  const [pendingPublicItem, setPendingPublicItem] = useState<any | null>(null);
  const [publicSize, setPublicSize] = useState<'S' | 'M' | 'L'>('M');
  const [publicQty, setPublicQty] = useState<number>(1);
  const [publicAddons, setPublicAddons] = useState<any[]>([]);
  const [addedFeedback, setAddedFeedback] = useState(false);

  /* ── Checkout Details State ── */
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  /* ── Login State ── */
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  /* ── FAQ State ── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  /* ── Branches State ── */
  const branches = ['KNUST BRANCH', 'ADUM BRANCH', 'BANTAMA BRANCH', 'AHODWO BRANCH'];
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  /* ── Sliders State ── */
  const [jollofIndex, setJollofIndex] = useState(0);
  const [friedIndex, setFriedIndex] = useState(0);
  const [bankuIndex, setBankuIndex] = useState(0);
  const jollofItems = landingMenu.filter(m => m.category === 'jollof');
  const friedItems = landingMenu.filter(m => m.category === 'fried');
  const bankuItems = landingMenu.filter(m => m.category === 'banku');
  const featuredJollof = jollofItems[jollofIndex] || jollofItems[0];
  const featuredFried = friedItems[friedIndex] || friedItems[0];
  const featuredBanku = bankuItems[bankuIndex] || bankuItems[0];
  const [toastMessage, setToastMessage] = useState('');

  /* ── Scroll effect for header, nav bar hiding & image toggling ── */
  const [scrolled, setScrolled] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      
      // Hide nav bar when scrolling down past 100px, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowNav(true);
      }
      lastScrollY.current = currentScrollY;
      
      // Auto-toggle images as user scrolls down, ensuring scroll position index is non-negative
      const scrubY = Math.max(0, currentScrollY);
      if (jollofItems.length > 0) setJollofIndex(Math.floor(scrubY / 400) % jollofItems.length);
      if (friedItems.length > 0) setFriedIndex(Math.floor(scrubY / 400) % friedItems.length);
      if (bankuItems.length > 0) setBankuIndex(Math.floor(scrubY / 400) % bankuItems.length);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [jollofItems.length, friedItems.length, bankuItems.length]);

  /* ── Scroll Animations Observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up-fade');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    const timeoutId = setTimeout(() => {
      document.querySelectorAll('.scroll-anim').forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    }
  }, [view]);

  /* ── Cart Helpers ── */
  const getPublicItemPrice = (item: any, size: 'S' | 'M' | 'L', selectedAddons: any[]) => {
    if (!item) return 0;
    const basePrice = item.hasSizes ? (item.prices?.[size] || 0) : (item.prices?.fixed || 0);
    const addonsTotal = selectedAddons.reduce((sum: number, addon: any) => sum + addon.price, 0);
    return basePrice + addonsTotal;
  };

  const handleAddPublicCart = () => {
    if (!pendingPublicItem) return;
    const unitPrice = getPublicItemPrice(pendingPublicItem, publicSize, publicAddons);
    setPublicCart([...publicCart, {
      cartItemId: crypto.randomUUID(), item: pendingPublicItem, size: publicSize, quantity: publicQty, addons: [...publicAddons], unitPrice, totalPrice: unitPrice * publicQty
    }]);
    setPublicQty(1);
    setPublicAddons([]);
    
    // Show feedback and toast
    setAddedFeedback(true);
    setToastMessage(`Added ${pendingPublicItem.name} to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  const handleWhatsAppSubmit = () => {
    if (!customerName.trim() || !deliveryLocation.trim()) {
      setToastMessage("Please enter Name and Delivery Location!");
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const total = publicCart.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    
    // Construct premium WhatsApp message
    let msg = `🔔 *New Web Order* 🔔\n\n`;
    msg += `👤 *Customer:* ${customerName.trim()}\n`;
    if (customerPhone.trim()) msg += `📞 *Phone:* ${customerPhone.trim()}\n`;
    msg += `📍 *Delivery:* ${deliveryLocation.trim()}\n`;
    if (specialNotes.trim()) msg += `📝 *Notes:* ${specialNotes.trim()}\n`;
    
    if (total >= 100) {
      msg += `🎁 *Promo:* Free Spicy Shito Jar Unlocked! 🌶️\n`;
    }
    
    msg += `\n🛒 *Items Ordered:*\n`;
    
    publicCart.forEach((item: any) => {
      msg += `• ${item.quantity}x ${item.item.name} (${item.size})\n`;
      if (item.addons.length > 0) {
        const addonCounts: Record<string, number> = {};
        item.addons.forEach((a: any) => {
          addonCounts[a.name] = (addonCounts[a.name] ?? 0) + 1;
        });
        const addonStr = Object.entries(addonCounts)
          .map(([name, qty]) => `${name}${qty > 1 ? ` (x${qty})` : ''}`)
          .join(', ');
        msg += `  Add-ons: ${addonStr}\n`;
      }
    });
    
    msg += `\n*Total:* GH₵ ${total.toFixed(2)}`;
    
    window.open(`https://wa.me/233505201685?text=${encodeURIComponent(msg)}`, '_blank');
    
    // Clean up
    setPublicCart([]);
    setIsPublicCartOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryLocation('');
    setSpecialNotes('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) { setError('Please enter both identifier and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      const user = state.staff.find(
        (member) => member.emailOrPhone.toLowerCase() === identifier.trim().toLowerCase() && member.passwordHash === password
      );
      if (user) { dispatch({ type: 'LOGIN_USER', payload: user }); setIsLoginOpen(false); }
      else { setError('Incorrect credentials. Unauthorized access.'); }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 pb-24 lg:pb-0" style={{ backgroundImage: bgPattern, backgroundAttachment: 'fixed' }}>
      
      {/* ── TOAST NOTIFICATION ── */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none flex items-center justify-center ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
         <div className="bg-[#431407] text-white px-6 py-3 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.5)] font-black text-xs tracking-wider flex items-center gap-2 border border-[#d97706]/30">
            <Sparkles size={14} className="text-[#d97706]" /> {toastMessage}
         </div>
      </div>

      {/* ── STORE CLOSED BANNER ── */}
      {!state.storeSettings.isOpen && (
        <div className="bg-red-600 text-white text-center text-xs font-black uppercase tracking-widest py-2 z-[60] relative">
          ⚠️ We are currently closed and not accepting online orders at this time.
        </div>
      )}

      {/* ── TOP NAV ── */}
      <div className={`fixed ${!state.storeSettings.isOpen ? 'top-8' : 'top-0'} w-full z-50 transition-all duration-300 ${!showNav && scrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'} ${scrolled || view === 'menu' ? 'bg-[#431407]/95 border-b-4 border-[#d97706] backdrop-blur-md pb-4 pt-4 shadow-2xl' : 'bg-gradient-to-b from-black/60 to-transparent pb-10 pt-4'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Left: Logos & Brand Pill */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-white shadow-[0_5px_15px_rgba(217,119,6,0.3)] bg-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
               <img src="/logo_square.png" alt="Bells Kitchen" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none group-hover:translate-x-1 transition-transform">
              <span className="font-black text-white text-xl tracking-tight drop-shadow-md">BELLS</span>
              <span className="font-black text-[#d97706] text-[10px] tracking-[0.3em] uppercase drop-shadow-sm">KITCHEN</span>
            </div>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden lg:flex items-center gap-8 bg-white/10 backdrop-blur-md border border-white/10 shadow-inner rounded-full px-8 py-2.5">
            <NavItem icon={<Home/>} label="Home" active={view === 'home'} onClick={() => { setView('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }} />
            <NavItem icon={<MenuIcon/>} label="OUR MENU" active={view === 'menu'} onClick={() => { setView('menu'); window.scrollTo({top: 0, behavior: 'smooth'}); }} />
            <NavItem icon={<Store/>} label="Outlets" onClick={() => { setView('home'); setTimeout(() => document.getElementById('our-outlets')?.scrollIntoView({ behavior: 'smooth' }), 100); }} />
          </div>

          {/* Right: Order Now Button & Login */}
          <div className="flex items-center gap-3">
            <button disabled={!state.storeSettings.isOpen} onClick={() => setView('menu')} className="hidden sm:flex bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-full items-center p-1.5 pr-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 group relative border-2 border-transparent hover:border-[#d97706]">
              <div className="bg-[#ffefd4] rounded-full w-9 h-9 flex items-center justify-center relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" alt="User" />
              </div>
              <span className="font-black px-3 text-sm text-gray-900 group-hover:text-[#d97706] transition-colors">
                {state.storeSettings.isOpen ? 'Order Now' : 'Closed'}
              </span>
            </button>
            <button onClick={() => setIsPublicCartOpen(true)} className="relative w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-900 shadow-lg transition-all hover:scale-110 group">
               <ShoppingBag size={18} className="group-hover:text-[#d97706] transition-colors" />
               {publicCart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#d97706] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">{publicCart.length}</span>}
            </button>
            <button onClick={() => setIsLoginOpen(true)} className="w-10 h-10 bg-[#431407] hover:bg-[#d97706] rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 ml-2 border border-white/20">
               <User size={18}/>
            </button>
          </div>

        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] bg-[#431407]/80 backdrop-blur-xl border border-[#d97706]/30 z-[60] shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-full py-1.5 px-2 transition-all duration-300 ${showNav ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between">
          <button onClick={() => { setView('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={`flex flex-col items-center justify-center gap-1 w-[30%] py-2 rounded-full transition-all ${view === 'home' ? 'bg-[#d97706] text-white shadow-lg scale-105' : 'text-white/60 hover:text-white'}`}>
            <Home size={18} />
            <span className="text-[9px] font-black tracking-widest uppercase">Home</span>
          </button>
          <button onClick={() => { setView('menu'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className={`flex flex-col items-center justify-center gap-1 w-[30%] py-2 rounded-full transition-all ${view === 'menu' ? 'bg-[#d97706] text-white shadow-lg scale-105' : 'text-white/60 hover:text-white'}`}>
            <MenuIcon size={18} />
            <span className="text-[9px] font-black tracking-widest uppercase">Menu</span>
          </button>
          <button onClick={() => { setView('home'); setTimeout(() => document.getElementById('our-outlets')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex flex-col items-center justify-center gap-1 w-[30%] py-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Store size={18} />
            <span className="text-[9px] font-black tracking-widest uppercase">Outlets</span>
          </button>
        </div>
      </div>

      {view === 'home' && (
      <>
        {/* ── MASSIVE HERO SECTION ── */}
      <div className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden mt-0" id="home">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 w-full h-full bg-black pointer-events-none">
           <img src="https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=2000" alt="Delicious Food Background" className="w-full h-full object-cover opacity-60 scale-105 animate-[slow-zoom_20s_ease-in-out_infinite_alternate] pointer-events-none" />
           <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#f8f9fa] mix-blend-multiply pointer-events-none"/>
           <div className="absolute inset-0 bg-gradient-to-tr from-[#d97706]/20 to-transparent pointer-events-none"/>
        </div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-[#d97706]/20 rounded-full blur-2xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-[#ffefd4]/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 mt-20 scroll-anim">
           <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-[#ffefd4] font-black px-6 py-2.5 rounded-full text-xs tracking-[0.3em] mb-8 shadow-xl uppercase relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"/>
             Welcome to Bells Kitchen
           </div>
           
           <div className="relative pt-6 pb-6">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d97706]/40 blur-[100px] rounded-full pointer-events-none"/>
             <h1 className="text-white text-5xl md:text-7xl lg:text-[7rem] font-black mb-8 tracking-tighter leading-[1.05] relative z-10 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                Redefining <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffefd4] to-[#d97706] italic drop-shadow-[0_5px_15px_rgba(217,119,6,0.5)]">Everyday</span> Meals.
             </h1>
             <p className="text-white/90 text-lg md:text-2xl font-semibold leading-relaxed mb-12 max-w-2xl mx-auto relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                Experience the finest Jollof and Fried Rice, delivered hot in our signature premium packaging. <span className="text-[#ffefd4]">True flavors of Kumasi.</span>
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <button disabled={!state.storeSettings.isOpen} onClick={() => setView('menu')} className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed hover-sweep text-white font-black text-sm tracking-wider py-4 px-12 rounded-full shadow-[0_10px_30px_rgba(217,119,6,0.5)] hover:shadow-[0_15px_40px_rgba(217,119,6,0.7)] hover:-translate-y-1 hover:scale-105 transition-all">
                  {state.storeSettings.isOpen ? 'EXPLORE MENU' : 'STORE CLOSED'}
                </button>
                <button onClick={() => document.getElementById('our-outlets')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-black text-sm tracking-wider py-4 px-12 rounded-full hover:bg-white hover:text-[#431407] hover:border-white transition-all shadow-lg hover:-translate-y-1 hover:scale-105">
                  FIND US
                </button>
             </div>
           </div>
        </div>
      </div>

      {/* ── JOLLOF MENU SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col lg:flex-row gap-12 items-center scroll-anim" id="our-menu">
        {/* Left Side: Brand Identity */}
        <div className="w-full lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left pt-10">
          <div className="flex items-center gap-6">
            <div className="bg-[#431407] text-white rounded-[2rem] w-32 h-32 flex flex-col items-center justify-center -rotate-[10deg] animate-pulse-glow border-4 border-white transform transition hover:rotate-0 hover:scale-105 duration-300">
               <div className="w-12 h-6 bg-white/20 rounded-md mb-2 flex items-center justify-center"><Flame size={16} className="text-white"/></div>
               <span className="font-black text-xs">BELLS BOX</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">ESTD 2018</span>
              <h2 className="text-3xl font-black text-gray-800 leading-none">BELLS</h2>
              <div className="text-[#431407] text-3xl font-black">RICE</div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-[#431407] mt-1" />
            </div>
          </div>
          <h2 className="text-[2.75rem] font-black mt-12 italic text-[#343a40] tracking-tighter">Bells Jollof Menu</h2>
        </div>

        {/* Right Side: Slider & Details */}
        <div className="w-full lg:w-[65%]">
          {/* Main Image Slider */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group bg-amber-100 aspect-[21/9] cursor-pointer" onClick={() => { if(state.storeSettings.isOpen && featuredJollof.available) setPendingPublicItem(featuredJollof); }}>
            <img src={featuredJollof.imageUrl} alt={featuredJollof.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            {/* Arrows */}
            <button onClick={(e) => { e.stopPropagation(); setJollofIndex((p) => (p > 0 ? p - 1 : jollofItems.length - 1)); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-10"><ChevronLeft size={24}/></button>
            <button onClick={(e) => { e.stopPropagation(); setJollofIndex((p) => (p < jollofItems.length - 1 ? p + 1 : 0)); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-10"><ChevronRight size={24}/></button>
            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {jollofItems.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setJollofIndex(i); }} className={`h-2 rounded-full transition-all ${i === jollofIndex ? 'w-6 bg-[#d97706]' : 'w-2 bg-white/60 hover:bg-white'}`} />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mt-8 flex flex-col items-start max-w-2xl">
            <h3 className="text-3xl font-black text-[#d97706] italic flex items-center gap-2 tracking-tight">
              {featuredJollof.name} <ArrowUpRight size={20} strokeWidth={3} />
            </h3>
            <p className="text-[#6c757d] mt-4 leading-relaxed font-semibold text-[15px]">
              {featuredJollof.description}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6">
              <button disabled={!featuredJollof.available || !state.storeSettings.isOpen} onClick={() => setPendingPublicItem(featuredJollof)} className="hover-sweep disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-sm tracking-wider py-3.5 px-10 rounded-full shadow-[0_10px_20px_rgba(217,119,6,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
                {state.storeSettings.isOpen ? 'ORDER NOW' : 'CLOSED'}
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Starting From</span>
                <span className="text-2xl font-black text-gray-900 leading-none">¢{featuredJollof.hasSizes ? (featuredJollof.prices.S || featuredJollof.prices.M) : (featuredJollof.prices as any).fixed}</span>
              </div>
            </div>
          </div>

          {/* Sub Items */}
          <div className="mt-16 pt-4 border-t border-gray-200/60">
            <h4 className="text-2xl font-black italic mb-8 text-[#343a40]">Our Signature Jollofs</h4>
            <div className="flex gap-6 overflow-x-auto pb-6 pt-2 hide-scrollbar">
              {jollofItems.map((item, i) => (
                <div key={item.id} onClick={() => { setJollofIndex(i); if(state.storeSettings.isOpen && item.available) setPendingPublicItem(item); }} className="flex flex-col items-center flex-shrink-0 w-36 cursor-pointer group hover:scale-110 transition-transform duration-300">
                  <img src={item.imageUrl} alt={item.name} className={`w-[110px] h-[110px] rounded-full object-cover shadow-lg border-[5px] transition-all duration-300 group-hover:shadow-2xl ${i === jollofIndex ? 'border-[#d97706]' : 'border-white'}`} />
                  <div className={`text-white text-[11px] font-black py-3 px-3 rounded-2xl mt-[-15px] z-10 shadow-md text-center italic w-full uppercase tracking-wider transition-colors ${i === jollofIndex ? 'bg-[#d97706]' : 'bg-[#431407] group-hover:bg-[#2a0e05]'}`}>
                     {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BANKU MENU SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col lg:flex-row gap-12 items-center scroll-anim" id="banku-menu">
        {/* Left Side: Brand Identity */}
        <div className="w-full lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left pt-10">
          <div className="flex items-center gap-6">
            <div className="bg-[#431407] text-white rounded-[2rem] w-32 h-32 flex flex-col items-center justify-center -rotate-[10deg] animate-pulse-glow border-4 border-white transform transition hover:rotate-0 hover:scale-105 duration-300">
               <div className="w-12 h-6 bg-white/20 rounded-md mb-2 flex items-center justify-center"><Flame size={16} className="text-white"/></div>
               <span className="font-black text-xs text-center">BELLS<br/>LOCAL</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">ESTD 2018</span>
              <h2 className="text-3xl font-black text-gray-800 leading-none tracking-tight">BELLS</h2>
              <div className="text-[#431407] text-3xl font-black tracking-tight">BANKU</div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-[#431407] mt-1" />
            </div>
          </div>
          <h2 className="text-[2.75rem] font-black mt-12 italic text-[#343a40] tracking-tighter leading-none">Bells Banku &amp; Tilapia</h2>
        </div>

        {/* Right Side: Slider & Details */}
        <div className="w-full lg:w-[65%]">
          {/* Main Image Slider */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group bg-amber-100 aspect-[21/9] cursor-pointer" onClick={() => { if(state.storeSettings.isOpen && featuredBanku.available) setPendingPublicItem(featuredBanku); }}>
            <img src={featuredBanku.imageUrl} alt={featuredBanku.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            {/* Arrows */}
            <button onClick={(e) => { e.stopPropagation(); setBankuIndex((p) => (p > 0 ? p - 1 : bankuItems.length - 1)); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-10"><ChevronLeft size={24}/></button>
            <button onClick={(e) => { e.stopPropagation(); setBankuIndex((p) => (p < bankuItems.length - 1 ? p + 1 : 0)); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-10"><ChevronRight size={24}/></button>
            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {bankuItems.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setBankuIndex(i); }} className={`h-2 rounded-full transition-all ${i === bankuIndex ? 'w-6 bg-[#d97706]' : 'w-2 bg-white/60 hover:bg-white'}`} />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mt-8 flex flex-col items-start max-w-2xl">
            <h3 className="text-3xl font-black text-[#d97706] italic flex items-center gap-2 tracking-tight">
              {featuredBanku.name} <ArrowUpRight size={20} strokeWidth={3} />
            </h3>
            <p className="text-[#6c757d] mt-4 leading-relaxed font-semibold text-[15px]">
              {featuredBanku.description}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6">
              <button disabled={!featuredBanku.available || !state.storeSettings.isOpen} onClick={() => setPendingPublicItem(featuredBanku)} className="hover-sweep disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-sm tracking-wider py-3.5 px-10 rounded-full shadow-[0_10px_20px_rgba(217,119,6,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
                {state.storeSettings.isOpen ? 'ORDER NOW' : 'CLOSED'}
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Starting From</span>
                <span className="text-2xl font-black text-gray-900 leading-none">¢{featuredBanku.hasSizes ? (featuredBanku.prices.S || featuredBanku.prices.M) : (featuredBanku.prices as any).fixed}</span>
              </div>
            </div>
          </div>

          {/* Sub Items */}
          <div className="mt-16 pt-4 border-t border-gray-200/60">
            <h4 className="text-2xl font-black italic mb-8 text-[#343a40]">Our Signature Banku</h4>
            <div className="flex gap-6 overflow-x-auto pb-6 pt-2 hide-scrollbar">
              {bankuItems.map((item, i) => (
                <div key={item.id} onClick={() => { setBankuIndex(i); if(state.storeSettings.isOpen && item.available) setPendingPublicItem(item); }} className="flex flex-col items-center flex-shrink-0 w-36 cursor-pointer group hover:scale-110 transition-transform duration-300">
                  <img src={item.imageUrl} alt={item.name} className={`w-[110px] h-[110px] rounded-full object-cover shadow-lg border-[5px] transition-all duration-300 group-hover:shadow-2xl ${i === bankuIndex ? 'border-[#d97706]' : 'border-white'}`} />
                  <div className={`text-white text-[11px] font-black py-3 px-3 rounded-2xl mt-[-15px] z-10 shadow-md text-center italic w-full uppercase tracking-wider transition-colors line-clamp-1 ${i === bankuIndex ? 'bg-[#d97706]' : 'bg-[#431407] group-hover:bg-[#2a0e05]'}`}>
                     {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FRIED RICE MENU SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-12 items-center border-t border-gray-200/50 mt-8 scroll-anim">
        {/* Left Side: Brand Identity */}
        <div className="w-full lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left pt-10">
          <div className="flex items-center gap-6">
            <div className="bg-[#431407] text-white rounded-[2rem] w-32 h-32 flex flex-col items-center justify-center rotate-[10deg] animate-pulse-glow border-4 border-white transform transition hover:rotate-0 hover:scale-105 duration-300">
               <div className="w-10 h-12 bg-[#ffefd4] rounded-t-lg rounded-b-sm mb-1 opacity-90 flex items-center justify-center font-black text-[#d97706] text-xs shadow-inner">B</div>
               <span className="font-black text-xs">RICE BAG</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#d97706] pb-1"><Flame size={32} strokeWidth={2.5} className="fill-[#d97706]"/></div>
              <h2 className="text-2xl font-black text-[#431407] leading-none tracking-tight">FRIED RICE</h2>
              <span className="text-[10px] font-bold text-[#d97706] tracking-widest italic mt-1">it's flaming hot</span>
            </div>
          </div>
          <h2 className="text-[2.75rem] font-black mt-12 italic text-[#343a40] tracking-tighter">Bells Fried Menu</h2>
        </div>

        {/* Right Side: Slider & Details */}
        <div className="w-full lg:w-[65%]">
          {/* Main Image Slider */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl group bg-amber-100 aspect-[21/9] cursor-pointer" onClick={() => { if(state.storeSettings.isOpen && featuredFried.available) setPendingPublicItem(featuredFried); }}>
            <img src={featuredFried.imageUrl} alt={featuredFried.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <button onClick={(e) => { e.stopPropagation(); setFriedIndex((p) => (p > 0 ? p - 1 : friedItems.length - 1)); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-10"><ChevronLeft size={24}/></button>
            <button onClick={(e) => { e.stopPropagation(); setFriedIndex((p) => (p < friedItems.length - 1 ? p + 1 : 0)); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#d97706] shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95 z-10"><ChevronRight size={24}/></button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {friedItems.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setFriedIndex(i); }} className={`h-2 rounded-full transition-all ${i === friedIndex ? 'w-6 bg-[#d97706]' : 'w-2 bg-white/60 hover:bg-white'}`} />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mt-8 flex flex-col items-start max-w-2xl">
            <h3 className="text-3xl font-black text-[#d97706] italic flex items-center gap-2 tracking-tight">
              {featuredFried.name} <ArrowUpRight size={20} strokeWidth={3} />
            </h3>
            <p className="text-[#6c757d] mt-4 leading-relaxed font-semibold text-[15px]">
              {featuredFried.description}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6">
              <button disabled={!featuredFried.available || !state.storeSettings.isOpen} onClick={() => setPendingPublicItem(featuredFried)} className="hover-sweep disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-sm tracking-wider py-3.5 px-10 rounded-full shadow-[0_10px_20px_rgba(217,119,6,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
                {state.storeSettings.isOpen ? 'ORDER NOW' : 'CLOSED'}
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Starting From</span>
                <span className="text-2xl font-black text-gray-900 leading-none">¢{featuredFried.hasSizes ? (featuredFried.prices.S || featuredFried.prices.M) : (featuredFried.prices as any).fixed}</span>
              </div>
            </div>
          </div>

          {/* Sub Items */}
          <div className="mt-16 pt-4 border-t border-gray-200/60">
            <h4 className="text-2xl font-black italic mb-8 text-[#343a40]">Our Signature Fried Rice</h4>
            <div className="flex gap-6 overflow-x-auto pb-6 pt-2 hide-scrollbar">
              {friedItems.map((item, i) => (
                <div key={item.id} onClick={() => { setFriedIndex(i); if(state.storeSettings.isOpen && item.available) setPendingPublicItem(item); }} className="flex flex-col items-center flex-shrink-0 w-36 cursor-pointer group hover:scale-110 transition-transform duration-300">
                  <img src={item.imageUrl} alt={item.name} className={`w-[110px] h-[110px] rounded-full object-cover shadow-lg border-[5px] transition-all duration-300 group-hover:shadow-2xl ${i === friedIndex ? 'border-[#d97706]' : 'border-white'}`} />
                  <div className={`text-white text-[11px] font-black py-3 px-3 rounded-2xl mt-[-15px] z-10 shadow-md text-center italic w-full uppercase tracking-wider transition-colors ${i === friedIndex ? 'bg-[#d97706]' : 'bg-[#431407] group-hover:bg-[#2a0e05]'}`}>
                     {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PACKAGING EXPERIENCE SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 py-16 scroll-anim" id="packaging">
        <div className="bg-[#431407] rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row items-center border-4 border-[#d97706]/20">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center"/>
          <div className="w-full md:w-1/2 p-12 lg:p-20 relative z-10">
             <h2 className="text-[#d97706] text-xs font-black uppercase tracking-[0.2em] mb-4">The Bells Experience</h2>
             <h3 className="text-4xl md:text-[3rem] font-black italic mb-8 leading-tight text-white">Unbox <br/>Unforgettable <br/>Flavors.</h3>
             <p className="text-white/80 font-medium leading-relaxed mb-10 text-lg">
               Our premium packaging is designed to keep your food piping hot and perfectly intact. From our kitchen to your table, we ensure every detail reflects our commitment to excellence.
             </p>
             <button onClick={() => { setView('menu'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover-sweep text-white font-black text-sm tracking-wider py-4 px-10 rounded-full shadow-[0_10px_20px_rgba(217,119,6,0.25)] hover:-translate-y-1 transition-all">
               ORDER NOW
             </button>
          </div>
          <div className="w-full md:w-1/2 p-8 relative z-10 flex justify-center">
             <img src="/packaging_trio.jpg" alt="Bells Packaging" className="w-[85%] rounded-[2rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-[8px] border-white/10 animate-float" />
          </div>
        </div>
      </div>


      {/* ── OUR OUTLETS SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 py-20 mt-12 border-t border-gray-200/50 scroll-anim" id="our-outlets">
        
        {/* Timeline Branch Selector */}
        <div className="flex items-center gap-4 mb-16 relative">
           <button className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10 hover:bg-gray-50 flex-shrink-0"><ChevronLeft size={20}/></button>
           
           <div className="absolute left-[3.5rem] right-[3.5rem] h-0 border-t-2 border-dashed border-gray-300 top-1/2 -translate-y-1/2 z-0" />

           <div className="flex gap-6 overflow-x-auto relative z-10 hide-scrollbar flex-1 items-center px-4 py-2">
             {branches.map((branch) => {
               const active = selectedBranch === branch;
               return (
                 <div key={branch} onClick={() => setSelectedBranch(branch)} className={`flex items-center gap-3 px-6 py-3.5 rounded-full flex-shrink-0 font-black text-xs tracking-wider cursor-pointer border transition-all ${active ? 'bg-[#431407] text-white border-[#431407] shadow-[0_8px_16px_rgba(67,20,7,0.2)]' : 'bg-white text-gray-500 border-gray-200 shadow-sm hover:bg-gray-50'}`}>
                   <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${active ? 'bg-[#ffefd4]' : 'bg-gray-200'}`}>
                     <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-[#d97706] shadow-sm' : 'bg-gray-400'}`}/>
                   </div>
                   {active ? <MapPin size={16}/> : <Store size={16}/>} 
                   {branch}
                 </div>
               );
             })}
           </div>

           <button className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm z-10 hover:bg-gray-50 flex-shrink-0"><ChevronRight size={20}/></button>
        </div>

        {/* Map & Details */}
        <div className="flex flex-col lg:flex-row gap-8 h-[550px]">
          {selectedBranch === 'KNUST BRANCH' ? (
            <>
              {/* Details panel */}
              <div className="w-full lg:w-[35%] flex flex-col gap-6 h-full">
                <div className="relative">
                  <input type="text" placeholder="Search for branches by name or location" className="w-full border border-gray-200 rounded-full py-4 px-6 text-sm font-semibold shadow-sm focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] transition-all text-gray-700"/>
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                </div>
                
                <div 
                  className="bg-[#431407] rounded-[2rem] border-[4px] border-[#d97706]/20 shadow-2xl p-8 flex-1 flex flex-col hover:shadow-[0_15px_30px_rgba(217,119,6,0.2)] transition-shadow relative overflow-hidden cursor-pointer group" 
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedBranch + ' Kumasi Ghana')}`, '_blank')}
                  style={{ backgroundImage: bgPatternBrownUrl }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97706] rounded-bl-full opacity-10 pointer-events-none"/>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <h3 className="font-black text-xl text-white uppercase tracking-wide">{selectedBranch}</h3>
                    <div className="w-10 h-10 rounded-full bg-[#d97706] border border-[#b45309] flex items-center justify-center shadow-lg"><ArrowUpRight size={18} className="text-white"/></div>
                  </div>
                  <div className="text-sm text-white/80 mb-8 font-semibold leading-relaxed relative z-10">
                    Opposite No Weapon Hostel Annex<br/>
                    KUMASI REGION
                  </div>
                  <h4 className="font-black text-[#d97706] mb-4 relative z-10 tracking-widest uppercase text-[10px]">Hours Of Operation</h4>
                  <div className="text-sm text-white font-semibold relative z-10 bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
                    <p>Sunday - Saturday<br/>09:00 - 22:00</p>
                  </div>
                </div>
              </div>

              {/* Map panel */}
              <div className="w-full lg:w-[65%] h-full rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-200 bg-white relative p-2">
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                  <iframe title="map" src="https://maps.google.com/maps?q=No%20Weapon%20Hostel,%20KNUST,%20Kumasi,%20Ghana&t=&z=16&ie=UTF8&iwloc=&output=embed" className="w-full h-full border-0 filter brightness-95 contrast-125 saturate-50 hover:filter-none transition-all duration-700"/>
                  {/* Map pin overlay mimicking image */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-xl animate-bounce">
                    <MapPin size={48} className="text-[#d97706] fill-[#d97706]" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-[#431407] rounded-[2.5rem] border-4 border-[#d97706]/20 shadow-2xl p-12 flex flex-col items-center justify-center text-center relative overflow-hidden group" style={{ backgroundImage: bgPatternBrownUrl }}>
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-5 filter grayscale group-hover:grayscale-0 transition-all duration-1000"/>
               <div className="absolute inset-0 bg-gradient-to-t from-[#431407] via-[#431407]/80 to-transparent"/>
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#d97706] rounded-bl-full opacity-10 pointer-events-none blur-3xl animate-pulse"/>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffefd4] rounded-tr-full opacity-10 pointer-events-none blur-3xl animate-pulse delay-700"/>
               
               <Store size={80} className="text-[#d97706] mb-8 relative z-10 animate-bounce shadow-xl rounded-full bg-white/5 p-4 border border-white/10" />
               <h3 className="font-black text-5xl md:text-6xl text-white uppercase tracking-tighter italic mb-6 relative z-10 drop-shadow-lg">{selectedBranch}</h3>
               <div className="bg-[#d97706] text-white font-black px-6 py-2 rounded-full text-xs sm:text-sm tracking-[0.3em] shadow-xl uppercase relative z-10 mb-6 border border-[#ffefd4]/30">
                 Coming Soon
               </div>
               <p className="text-white/80 font-medium text-lg max-w-xl mx-auto relative z-10 leading-relaxed">
                 We are actively preparing to bring the authentic Bells Kitchen experience to this location. Stay tuned for our grand opening!
               </p>
            </div>
          )}
        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 py-20 bg-[#d97706] rounded-[3rem] shadow-2xl border-4 border-[#ffefd4]/20 my-12 scroll-anim relative overflow-hidden" id="reviews">
        {/* Decorative background circle */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[#b45309] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-[#ffefd4] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        
        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <h2 className="text-[#ffefd4] text-xs font-black uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Testimonials</h2>
          <h3 className="text-4xl font-black text-white italic tracking-tight drop-shadow-md">What Our Family Says</h3>
        </div>
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 px-4 lg:px-8 relative z-10 hide-scrollbar snap-x snap-mandatory">
          {[
            { name: "Ama K.", review: "The best Jollof in Kumasi! The packaging kept it so hot, and the flavors are incredibly rich.", rating: 5 },
            { name: "Kwame D.", review: "I order the Assorted Fried Rice every weekend. Consistent quality and the delivery is always swift.", rating: 5 },
            { name: "Sarah O.", review: "Finally, proper party Jollof without having to wait for a wedding. Absolutely love the new branding too!", rating: 5 },
          ].map((rev, i) => (
            <div key={i} className="flex-shrink-0 w-[85%] md:w-auto snap-center bg-[#431407] p-10 rounded-[2rem] border-2 border-[#b45309]/50 shadow-xl hover:shadow-2xl transition-all relative group hover:-translate-y-2" style={{ backgroundImage: bgPatternBrownUrl }}>
               <div className="absolute top-8 right-8 text-white/5 group-hover:text-white/10 transition-colors">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
               </div>
               <div className="flex gap-1.5 mb-6 text-[#ffefd4]">
                 {[1,2,3,4,5].map(star => <Flame key={star} size={20} className="fill-[#ffefd4] drop-shadow-sm"/>)}
               </div>
               <p className="text-white/90 font-semibold leading-relaxed mb-8 italic text-lg relative z-10">"{rev.review}"</p>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#ffefd4] rounded-full flex items-center justify-center font-black text-[#d97706] text-xl shadow-inner group-hover:scale-110 group-hover:opacity-100 opacity-90 transition-all duration-500">{rev.name.charAt(0)}</div>
                 <h4 className="font-black text-white uppercase tracking-wider">{rev.name}</h4>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ SECTION ── */}
      <div className="max-w-4xl mx-auto px-4 py-20 mt-12 scroll-anim" id="faq">
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-[#d97706]/10 flex items-center justify-center text-[#d97706]">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-4xl font-black italic text-gray-900 tracking-tight">Frequently Asked</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 group hover:border-[#d97706] hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden relative">
              <HelpCircle size={80} className="absolute -top-4 -right-4 text-gray-50 opacity-0 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-gray-900 text-lg group-hover:text-[#d97706] transition-colors">{faq.q}</h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === faq.id ? 'bg-[#d97706] text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-[#d97706] group-hover:text-white'}`}>
                    <ChevronDown size={16} />
                  </div>
                </div>
                {openFaq === faq.id && (
                   <p className="text-gray-500 font-medium leading-relaxed pr-8 mt-4 animate-fade-in">{faq.a}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Ask Question Card */}
        <div className="mt-12 bg-[#431407] rounded-3xl p-10 relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(67,20,7,0.3)] transition-all duration-500 max-w-2xl mx-auto text-center">
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#d97706] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
           <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#ffefd4] rounded-full blur-3xl opacity-10" />
           <h3 className="text-white font-black text-2xl mb-3 relative z-10">Still have questions?</h3>
           <p className="text-white/70 font-medium text-base mb-8 relative z-10">Can't find the answer you're looking for? Please chat with our friendly team.</p>
           <button className="bg-[#d97706] text-white font-black text-sm uppercase tracking-widest py-4 px-8 rounded-full hover:bg-white hover:text-[#d97706] transition-colors inline-flex items-center justify-center gap-2 relative z-10">
             Get in touch <ArrowRight size={16} />
           </button>
        </div>
      </div>
      </>
      )}

      {view === 'menu' && (
        <div className="pt-24 pb-24 min-h-screen bg-[#f8f9fa] relative" style={{ backgroundImage: bgPattern, backgroundAttachment: 'fixed' }}>
          {/* Sub Header / Sticky Category Navigation */}
          <div className="sticky top-20 w-full bg-white/80 backdrop-blur-md border-b-4 border-[#d97706]/40 z-40 py-4 shadow-md transition-all">
            <div className="max-w-7xl mx-auto px-4 flex justify-center gap-3 md:gap-6">
              {['jollof', 'fried', 'banku'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const el = document.getElementById(`${cat}-section`);
                    if (el) {
                      const yOffset = -150; // offset for sticky nav
                      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="px-5 md:px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all bg-[#431407] text-[#ffefd4] hover:bg-[#d97706] hover:text-white border border-[#d97706]/20 shadow-sm hover:shadow-md active:scale-95"
                >
                  {cat === 'jollof' ? '🌶️ Jollof Rice' : cat === 'fried' ? '🔥 Fried Rice' : '🐟 Local Specials'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-12 mb-16 px-4">
            <h2 className="text-5xl md:text-7xl font-black italic text-gray-900 tracking-tighter mb-4">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] to-[#b45309]">Bells</span> Menu
            </h2>
            <p className="text-gray-500 font-bold text-lg max-w-md mx-auto">Explore our hot, wok-fired rice meals and local specialties. Fresh and hot.</p>
          </div>

          <div className="max-w-7xl mx-auto px-4 space-y-20">
            {Object.entries(
              landingMenu.reduce((acc, item) => {
                const cat = item.category;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(item);
                return acc;
              }, {} as Record<string, any[]>)
            ).map(([categoryName, items]) => (
              <div
                id={`${categoryName}-section`}
                key={categoryName}
                className="scroll-mt-32 border-b border-gray-200/50 pb-16 last:border-0"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-[#431407] text-[#ffefd4] rounded-[1.5rem] px-5 py-2 font-black text-xs uppercase tracking-widest border-2 border-[#d97706] shadow-md">
                    {categoryName === 'jollof' ? 'Proper Jollof' : categoryName === 'fried' ? 'Wok Fired' : 'Traditional'}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black italic text-gray-900 tracking-tight capitalize">
                    {categoryName === 'jollof' ? 'Signature Jollof Rice' : categoryName === 'fried' ? 'Classic Fried Rice' : 'Banku & Tilapia'}
                  </h3>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((item) => {
                    const priceDisplay = item.hasSizes
                      ? `¢${Math.min(...Object.values(item.prices as Record<string, number>))} - ¢${Math.max(...Object.values(item.prices as Record<string, number>))}`
                      : `¢${item.price}`;
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-200/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(217,119,6,0.15)] hover:border-[#d97706]/40 transition-all duration-500 group flex flex-col h-full relative"
                      >
                        {/* Image banner */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-amber-50">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          {!item.available && (
                            <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                              <span className="bg-red-500 text-white font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-sm shadow-xl">Sold Out</span>
                            </div>
                          )}
                          {item.available && (
                            <span className="absolute top-4 right-4 bg-[#431407]/90 text-[#ffefd4] border border-[#d97706]/30 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-10">
                              {categoryName === 'jollof' ? '🌶️ Spicy' : '🔥 Wok Hot'}
                            </span>
                          )}
                        </div>

                        {/* Card details */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-[#d97706] transition-colors">{item.name}</h4>
                            <span className="text-lg font-black text-[#d97706]">{priceDisplay}</span>
                          </div>
                          <p className="text-gray-500 font-semibold text-xs leading-relaxed mb-6 flex-1">{item.description}</p>
                          
                          <button
                            disabled={!item.available || !state.storeSettings.isOpen}
                            onClick={() => {
                              setPendingPublicItem(item);
                              setPublicSize(item.hasSizes ? 'M' : 'S');
                              setPublicQty(1);
                              setPublicAddons([]);
                            }}
                            className="w-full py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-md transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 hover-sweep"
                          >
                            {state.storeSettings.isOpen ? 'Add to Order' : 'Store Closed'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="bg-[#431407] text-white pt-24 pb-8 border-t-[12px] border-[#d97706] relative overflow-hidden mt-20">
        {/* Massive Background Text watermark */}
        <div className="absolute top-0 left-0 w-full overflow-hidden flex items-center justify-center opacity-5 pointer-events-none select-none">
          <span className="text-[15rem] font-black leading-none whitespace-nowrap">BELLS KITCHEN</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Newsletter Section */}
          <div className="bg-[#d97706] rounded-[2.5rem] p-10 md:p-14 mb-20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-[#ffefd4]/20 relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-50%] w-64 h-64 bg-white/20 rounded-full blur-3xl" />
            <div className="max-w-xl relative z-10">
              <h3 className="text-3xl md:text-5xl font-black italic tracking-tight mb-4 text-white">Join the Family.</h3>
              <p className="text-white/90 font-semibold text-lg">Subscribe to our newsletter for exclusive deals, new menu drops, and <span className="font-black text-[#ffefd4]">20% off your first online order.</span></p>
            </div>
            <div className="w-full md:w-auto flex-1 max-w-md relative z-10">
              <input type="email" placeholder="Enter your email address" className="w-full bg-[#431407]/40 border-2 border-[#b45309] text-white placeholder-white/50 rounded-full py-5 pl-6 pr-36 focus:outline-none focus:border-white focus:bg-[#431407]/60 transition-colors font-bold" />
              <button className="absolute right-2 top-2 bottom-2 bg-white text-[#d97706] rounded-full px-6 font-black uppercase tracking-wider text-sm hover:bg-[#ffefd4] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
                Subscribe <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-sm font-semibold text-white/70 mb-16">
            <div className="md:col-span-4">
               <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#d97706] mb-6 bg-white shadow-xl relative group cursor-pointer">
                  <img src="/logo_square.png" alt="Bells Kitchen" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               </div>
               <p className="leading-relaxed text-base max-w-xs text-white/80">
                 Crafted to redefine everyday meals. Fresh, bold, and unforgettable. Join the fast food revolution today.
               </p>
               <div className="flex gap-4 mt-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#d97706] hover:border-[#d97706] transition-all cursor-pointer text-white shadow-sm hover:-translate-y-1 hover:scale-110">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#d97706] hover:border-[#d97706] transition-all cursor-pointer text-white shadow-sm hover:-translate-y-1 hover:scale-110">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#d97706] hover:border-[#d97706] transition-all cursor-pointer text-white shadow-sm hover:-translate-y-1 hover:scale-110">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
               </div>
            </div>
            
            <div className="md:col-span-3 md:col-start-6">
              <h4 className="text-[#d97706] font-black text-lg mb-6 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-4">
                <li><button onClick={() => { setView('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-[#d97706] group-hover:translate-x-1 transition-transform"/> Home</button></li>
                <li><button onClick={() => { setView('menu'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-[#d97706] group-hover:translate-x-1 transition-transform"/> Our Menu</button></li>
                <li><button onClick={() => { setView('home'); setTimeout(() => document.getElementById('packaging')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-[#d97706] group-hover:translate-x-1 transition-transform"/> Packaging</button></li>
                <li><button onClick={() => { setView('home'); setTimeout(() => document.getElementById('our-outlets')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight size={14} className="text-[#d97706] group-hover:translate-x-1 transition-transform"/> Branch Locations</button></li>
              </ul>
            </div>
            
            <div className="md:col-span-3">
              <h4 className="text-[#d97706] font-black text-lg mb-6 uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><Mail size={16} className="text-[#d97706]" /> info@bellskitchen.com</li>
                <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer"><Flame size={16} className="text-[#d97706]" /> +233 505 201 685</li>
                <li className="flex items-start gap-3 mt-4 text-white/50 text-xs leading-relaxed border-t border-white/10 pt-4">
                  Bells Kitchen HQ<br/>
                  Opposite No Weapon Hostel Annex<br/>
                  KNUST, Kumasi
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-white/40">
            <p>© {new Date().getFullYear()} Bells Kitchen. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODALS (Order Flow) ── */}
      
      {/* STAFF LOGIN MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden bg-white relative">
            <button type="button" onClick={() => { setIsLoginOpen(false); setError(''); }} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 transition-all"><X size={16} /></button>
            <div className="p-8 text-center border-b border-gray-100">
              <div className="w-16 h-16 bg-[#fff8ed] rounded-full flex items-center justify-center mx-auto mb-4"><User size={24} className="text-[#d97706]"/></div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Staff Portal</h2>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Authorized cashiers only.</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="p-8 space-y-5 bg-gray-50/50">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl text-center shadow-sm">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest block text-gray-500">Email or Phone</label>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. cashier@bells.com" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest block text-gray-500">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] font-semibold" />
              </div>
              <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white text-sm font-black tracking-wider uppercase transition-all shadow-lg active:scale-95 bg-[#431407] hover:bg-[#2a0e05] disabled:opacity-50 mt-2">
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PUBLIC ORDER CONFIG MODAL */}
      {pendingPublicItem && (
        <div className="fixed inset-0 z-[80] flex justify-center sm:items-center sm:p-4 bg-black/60 backdrop-blur-md" onClick={() => setPendingPublicItem(null)}>
          <div className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-3xl sm:w-[90vw] lg:max-w-4xl bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col relative animate-slide-up sm:animate-none overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setPendingPublicItem(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/25 text-white hover:bg-black/45 transition-all z-30 shadow-md backdrop-blur-sm"><X size={18} strokeWidth={3} /></button>
            
            <div className="flex flex-col sm:flex-row h-full sm:h-[75vh] md:h-[80vh] overflow-hidden">
              {/* Left Side: Image Hero & Category switcher */}
              <div className="w-full sm:w-[40%] flex flex-col bg-[#431407] border-b sm:border-b-0 sm:border-r border-[#d97706]/20 flex-shrink-0 h-52 sm:h-full overflow-hidden">
                <div className="h-full relative overflow-hidden flex-1 bg-[#431407]">
                  <img src={pendingPublicItem.imageUrl || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800"} alt={pendingPublicItem.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                    <span className="text-[9px] text-[#ffefd4] font-black uppercase tracking-widest bg-amber-600/60 border border-amber-400/30 px-3 py-1 rounded-full mb-2 self-start backdrop-blur-xs select-none">Bells Signature</span>
                    <h2 className="text-2xl font-black text-white italic tracking-tight drop-shadow-md leading-tight">{pendingPublicItem.name}</h2>
                  </div>
                </div>

                {/* Quick menu switcher tabs below image */}
                <div className="flex-shrink-0 bg-[#431407] py-3.5 px-4 border-t border-[#d97706]/35 relative z-10">
                  <div className="flex flex-wrap gap-2 justify-start sm:justify-center">
                     {landingMenu.filter(m => m.available).map(m => (
                        <button key={m.id} onClick={() => {
                           setPendingPublicItem(m);
                           setPublicSize(m.hasSizes ? (m.prices.M ? 'M' : 'S') : 'M');
                           setPublicQty(1);
                           setPublicAddons([]);
                        }} className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all relative border ${m.id === pendingPublicItem.id ? 'bg-[#d97706] text-white border-[#d97706] shadow-sm' : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'}`}>
                           {m.name}
                        </button>
                     ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Options scroll area and subtotal footer */}
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                <div className="flex-1 overflow-y-auto hide-scrollbar bg-gray-50/50">
                  <div className="p-6 pb-5 border-b border-gray-100 bg-white">
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">{pendingPublicItem.description}</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {pendingPublicItem.hasSizes && (
                      <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest block text-gray-800">Select Size</label>
                        <div className="flex gap-3">
                          {(['S', 'M', 'L'] as const).filter(sz => pendingPublicItem.prices?.[sz] !== undefined).map(sz => (
                            <button key={sz} type="button" onClick={() => setPublicSize(sz)}
                              className={`flex-1 py-3 px-4 rounded-[1.5rem] text-sm font-black uppercase tracking-wider transition-all border-2 flex flex-col items-center justify-center leading-none bg-white ${
                                publicSize === sz
                                  ? 'bg-[#431407] text-[#ffefd4] border-[#d97706] shadow-xl scale-[1.03] ring-4 ring-[#d97706]/10'
                                  : 'border-gray-200 text-gray-700 hover:border-[#d97706]/40'
                              }`}>
                              <span className="text-xs font-black">{sz === 'S' ? 'Small' : sz === 'M' ? 'Medium' : 'Large'}</span>
                              <span className={`text-[10px] font-bold mt-1.5 ${publicSize === sz ? 'text-[#ffefd4]' : 'text-gray-400'}`}>¢{pendingPublicItem.prices?.[sz]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest block text-gray-800">Add-ons</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {state.addons.filter(a => a.available).map(addon => {
                          const price = addon.prices.fixed || 0;
                          const count = publicAddons.filter((a: any) => a.id === addon.id).length;
                          return (
                            <div key={addon.id} className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-xs font-bold ${
                              count > 0
                                ? 'border-[#d97706] bg-[#fffaf2] shadow-sm'
                                : 'border-gray-200 bg-white hover:border-[#d97706]/20 text-gray-600'
                            }`}>
                              <div className="flex flex-col gap-0.5">
                                <span className={`text-xs ${count > 0 ? 'text-[#431407] font-black' : 'text-gray-700'}`}>{addon.name}</span>
                                <span className="text-[10px] text-gray-400 font-medium">+¢{price}</span>
                              </div>
                              {count === 0 ? (
                                <button type="button" onClick={() => setPublicAddons([...publicAddons, { ...addon, price }])} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#d97706] hover:text-white flex items-center justify-center transition-all">
                                   <Plus size={14} strokeWidth={3} />
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 bg-white border border-[#d97706]/30 rounded-full p-1">
                                   <button type="button" onClick={() => {
                                     const idx = publicAddons.findIndex((a: any) => a.id === addon.id);
                                     const newAddons = [...publicAddons];
                                     newAddons.splice(idx, 1);
                                     setPublicAddons(newAddons);
                                   }} className="w-6 h-6 rounded-full bg-orange-100 hover:bg-[#d97706] hover:text-white flex items-center justify-center transition-all text-[#d97706]">
                                     <Minus size={12} strokeWidth={3} />
                                   </button>
                                   <input
                                     type="number"
                                     min="0"
                                     value={count === 0 ? '' : count}
                                     onChange={(e) => {
                                       const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                       if (!isNaN(val) && val >= 0) {
                                         const listWithoutAddon = publicAddons.filter((a: any) => a.id !== addon.id);
                                         const addedList = Array.from({ length: val }, () => ({ ...addon, price }));
                                         setPublicAddons([...listWithoutAddon, ...addedList]);
                                       }
                                     }}
                                     className="w-8 text-center text-xs font-black bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                   />
                                   <button type="button" onClick={() => setPublicAddons([...publicAddons, { ...addon, price }])} className="w-6 h-6 rounded-full bg-orange-100 hover:bg-[#d97706] hover:text-white flex items-center justify-center transition-all text-[#d97706]">
                                     <Plus size={12} strokeWidth={3} />
                                   </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Subtotal & Action buttons inside right side */}
                <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10 relative flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subtotal</p>
                      <p className="text-2xl font-black text-gray-900 mt-0.5">GH₵{(getPublicItemPrice(pendingPublicItem, publicSize, publicAddons) * publicQty).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm">
                      <button type="button" onClick={() => setPublicQty(Math.max(1, publicQty - 1))} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-full font-bold transition-all"><Minus size={14} strokeWidth={2.5} /></button>
                      <input
                        type="number"
                        min="1"
                        value={publicQty === 0 ? '' : publicQty}
                        onChange={(e) => {
                          if (e.target.value === '') {
                            setPublicQty(0);
                          } else {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 0) {
                              setPublicQty(val);
                            }
                          }
                        }}
                        onBlur={() => {
                          if (publicQty <= 0) setPublicQty(1);
                        }}
                        className="font-black text-gray-900 text-sm w-8 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button type="button" onClick={() => setPublicQty(publicQty + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-full font-bold transition-all"><Plus size={14} strokeWidth={2.5} /></button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={handleAddPublicCart} 
                      className={`flex-grow flex items-center justify-center py-4 rounded-full text-white text-sm font-black tracking-wider uppercase transition-all shadow-lg active:translate-y-0 ${
                        addedFeedback 
                          ? 'bg-emerald-600 shadow-[0_5px_15px_rgba(16,185,129,0.4)]' 
                          : 'bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#d97706] hover:-translate-y-0.5'
                      }`}
                    >
                      {addedFeedback ? '✓ Added to Order!' : 'Add to Order'}
                    </button>
                    {publicCart.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => { setPendingPublicItem(null); setIsPublicCartOpen(true); }} 
                        className="px-6 py-4 bg-[#431407] hover:bg-[#5c1d0a] text-[#ffefd4] font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-all hover:-translate-y-0.5 flex-shrink-0 font-extrabold"
                      >
                        Cart ({publicCart.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC CART DRAWER */}
      {isPublicCartOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-[80] flex justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col animate-slide-up sm:animate-none">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">Your Order Plate</h2>
                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{publicCart.length} Items Selected</p>
              </div>
              <button type="button" onClick={() => setIsPublicCartOpen(false)} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 transition-all"><X size={18} /></button>
            </div>
            
            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/50 hide-scrollbar">
              {/* Milestone progress bar if cart is not empty */}
              {publicCart.length > 0 && (() => {
                const cartTotal = publicCart.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
                const progressPercent = Math.min(100, (cartTotal / 100) * 100);
                return (
                  <div className="bg-[#fffbeb] border border-amber-200/60 rounded-2xl p-4 flex flex-col gap-2 shadow-sm animate-scale-in">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-[#431407] tracking-wider">
                      <span className="flex items-center gap-1">🌶️ Chef's Spicy Shito Bonus</span>
                      <span>{cartTotal >= 100 ? 'UNLOCKED' : `¢${cartTotal.toFixed(0)} / ¢100`}</span>
                    </div>
                    <div className="w-full bg-amber-200/40 rounded-full h-2 overflow-hidden border border-amber-300/20">
                      <div className="bg-[#d97706] h-2 rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">
                      {cartTotal >= 100 
                        ? '🎉 Congrats! A free signature jar of our hot Kumasi party shito has been added!' 
                        : `Add ¢${(100 - cartTotal).toFixed(2)} more to unlock a free jar of Kumasi party shito!`
                      }
                    </p>
                  </div>
                );
              })()}

              {publicCart.length === 0 ? (
                <div className="text-center py-12 px-6 flex flex-col items-center justify-center my-auto cursor-pointer" onClick={() => {
                  setIsPublicCartOpen(false);
                  setTimeout(() => {
                    document.getElementById('our-menu')?.scrollIntoView({ behavior: 'smooth' });
                  }, 300);
                }}>
                  <img 
                    src="/empty_cart_toy.png" 
                    alt="Cute Chef Mascot" 
                    className="w-48 h-48 object-contain mb-4 animate-bounce-sm hover:scale-110 transition-transform duration-500" 
                  />
                  <h3 className="font-black text-gray-800 text-lg uppercase tracking-wider mb-2">Your Cart is Empty</h3>
                  <div className="bg-[#fffbeb] border border-[#d97706]/20 rounded-2xl p-4 max-w-[300px] mb-6 shadow-sm select-none">
                    <p className="text-[#431407] text-xs font-black leading-relaxed italic text-center">
                      "Mmm... smells delicious out there! Tap here or browse our menu to add your favorite hot meals to your plate."
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPublicCartOpen(false);
                      setTimeout(() => {
                        document.getElementById('our-menu')?.scrollIntoView({ behavior: 'smooth' });
                      }, 300);
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#d97706] to-amber-500 hover:from-amber-600 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all select-none"
                  >
                    Add Items to Cart
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {publicCart.map((item: any) => (
                    <div key={item.cartItemId} className="bg-white rounded-[1.5rem] p-4 border border-gray-150/45 shadow-sm flex gap-4 transition-all hover:shadow-md">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#431407] border border-gray-100 shadow-inner">
                        <img src={item.item.imageUrl || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800"} alt={item.item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 leading-tight">{item.item.name}</h4>
                            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wide">Size: {item.size}</p>
                            {item.addons.length > 0 && <p className="text-[10px] text-gray-400 font-semibold mt-1 leading-normal">+ {item.addons.map((a: any) => a.name).join(', ')}</p>}
                          </div>
                          <span className="text-sm font-black text-[#d97706] select-none">GH₵{(item.totalPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-50">
                          <button type="button" onClick={() => setPublicCart(publicCart.filter((c: any) => c.cartItemId !== item.cartItemId))} className="text-[10px] text-gray-400 hover:text-red-500 font-black uppercase tracking-wider flex items-center gap-1 transition-colors"><Trash2 size={11} /> Remove</button>
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-150/40 rounded-full p-0.5">
                            <button type="button" onClick={() => { const nq = Math.max(1, item.quantity - 1); setPublicCart(publicCart.map((c: any) => c.cartItemId === item.cartItemId ? { ...c, quantity: nq, totalPrice: c.unitPrice * nq } : c)); }} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-800 font-bold shadow-sm hover:bg-gray-100 transition-colors"><Minus size={10} /></button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 0) {
                                  setPublicCart(publicCart.map((c: any) => c.cartItemId === item.cartItemId ? { ...c, quantity: val, totalPrice: c.unitPrice * val } : c));
                                }
                              }}
                              onBlur={() => {
                                if (item.quantity <= 0) {
                                  setPublicCart(publicCart.map((c: any) => c.cartItemId === item.cartItemId ? { ...c, quantity: 1, totalPrice: c.unitPrice } : c));
                                }
                              }}
                              className="text-gray-900 text-xs font-black w-6 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button type="button" onClick={() => { const nq = item.quantity + 1; setPublicCart(publicCart.map((c: any) => c.cartItemId === item.cartItemId ? { ...c, quantity: nq, totalPrice: c.unitPrice * nq } : c)); }} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-gray-800 font-bold shadow-sm hover:bg-gray-100 transition-colors"><Plus size={10} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Details Form */}
              {publicCart.length > 0 && (
                <div className="bg-white rounded-[2rem] p-5 border border-gray-150/45 shadow-sm space-y-4 animate-scale-in">
                  <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none border-b border-gray-100 pb-3">Delivery Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ama K."
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 0501234567"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Hostel / Delivery Location</label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="e.g. No Weapon Hostel Annex, Room 24"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Special Requests / Notes</label>
                    <input
                      type="text"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Extra hot shito, make chicken well done"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 outline-none transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Cross-Sell / Add-ons Section */}
            {publicCart.length > 0 && (
              <div className="bg-white border-t border-gray-100 p-4 pb-2 flex-shrink-0">
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Frequently Bought Together</h3>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {landingMenu.filter(m => m.available && m.category !== 'main' && !publicCart.some(c => c.item.id === m.id)).slice(0, 4).map(m => (
                    <div key={m.id} className="flex-shrink-0 w-32 bg-gray-50 rounded-2xl p-2.5 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                       <img src={m.imageUrl} alt={m.name} className="w-12 h-12 rounded-full object-cover mb-2 shadow-sm border-2 border-white"/>
                       <h4 className="text-[10px] font-black text-gray-900 leading-tight mb-1 truncate w-full">{m.name}</h4>
                       <span className="text-[10px] font-bold text-[#d97706] mb-2">¢{m.hasSizes ? (m.prices.S || m.prices.M) : (m.prices as any).fixed}</span>
                       <button onClick={() => { setIsPublicCartOpen(false); setPendingPublicItem(m); }} className="w-full py-1.5 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-700 hover:bg-[#d97706] hover:text-white hover:border-[#d97706] transition-colors">Add</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Summary & Checkout */}
            <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10 relative flex-shrink-0">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-black uppercase text-gray-500 tracking-widest">Total Amount</span>
                <span className="text-3xl font-black text-gray-900">GH₵{publicCart.reduce((sum: number, item: any) => sum + item.totalPrice, 0).toFixed(2)}</span>
              </div>
              <button disabled={publicCart.length === 0} type="button" onClick={handleWhatsAppSubmit} className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white text-sm font-black tracking-wider uppercase transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none bg-[#25D366] hover:bg-[#1ebd57] select-none">
                <Send size={16} /> Complete via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hide scrollbars class addition to head */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
         .scroll-anim {
          opacity: 0;
          transform: translateY(100px) scale(0.92);
          transition: opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: opacity, transform;
        }
        .scroll-anim.animate-slide-up-fade {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        @keyframes slow-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(217,119,6,0.2); } 50% { box-shadow: 0 0 40px rgba(217,119,6,0.6); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .hover-sweep { background-size: 200% auto; transition: background-position 0.5s; background-image: linear-gradient(to right, #d97706 0%, #b45309 51%, #d97706 100%); }
        .hover-sweep:hover { background-position: right center; }
      `}</style>
    </div>
  );
}
