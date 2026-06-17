import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ChefHat, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Utensils, 
  Sparkles,
  X,
  AlertCircle,
  Star,
  Search,
  CheckCircle,
  ThumbsUp,
  Heart,
  Flame,
  Award,
  Truck,
  Leaf,
  Phone,
  Send,
  ChevronRight,
  ShieldCheck,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';

export default function LandingScreen() {
  const { state, dispatch } = useApp();
  
  // Login Form States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Landing Page Interactive Menu State
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mains'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Reviews & Rating Filters State
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [dishFilter, setDishFilter] = useState<string>('all');

  // Write a Review modal form states
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRole, setReviewRole] = useState('Local Foodie');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewDish, setReviewDish] = useState('🍳 Signature Smokey Jollof Rice');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Helpful votes state
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({
    'rev-1': 24,
    'rev-2': 18,
    'rev-3': 15,
    'rev-4': 8,
    'rev-5': 12
  });
  const [upvotedReviews, setUpvotedReviews] = useState<string[]>([]);

  // Public Cart State
  const [publicCart, setPublicCart] = useState<any[]>([]);
  const [isPublicCartOpen, setIsPublicCartOpen] = useState(false);
  const [pendingPublicItem, setPendingPublicItem] = useState<any | null>(null);

  // Configuration states for pending public item
  const [publicSize, setPublicSize] = useState<'S' | 'M' | 'L'>('M');
  const [publicQty, setPublicQty] = useState<number>(1);
  const [publicAddons, setPublicAddons] = useState<any[]>([]);

  // Checkout states for public order
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceMethod, setServiceMethod] = useState<'takeaway' | 'delivery'>('takeaway');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const publicAddonOptions = [
    { id: 'item_010', name: 'Extra Chicken', price: 15 },
    { id: 'item_011', name: 'Egg', price: 3 },
    { id: 'item_008', name: 'Big Sausage', price: 7 },
    { id: 'item_009', name: 'Small Sausage', price: 3 },
    { id: 'item_007', name: 'Ripe Plantain (Kokoo)', price: 1 },
  ];

  const getPublicItemPrice = (item: any, size: 'S' | 'M' | 'L', selectedAddons: any[]) => {
    if (!item) return 0;
    const basePrice = item.prices ? item.prices[size] : parseFloat(item.price.replace(/[^\d.]/g, ''));
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return basePrice + addonsTotal;
  };

  const handleAddPublicCart = () => {
    if (!pendingPublicItem) return;
    const unitPrice = getPublicItemPrice(pendingPublicItem, publicSize, publicAddons);
    const cartItem = {
      cartItemId: crypto.randomUUID(),
      item: pendingPublicItem,
      size: publicSize,
      quantity: publicQty,
      addons: [...publicAddons],
      unitPrice: unitPrice,
      totalPrice: unitPrice * publicQty
    };
    setPublicCart([...publicCart, cartItem]);
    setPendingPublicItem(null);
    setPublicQty(1);
    setPublicAddons([]);
    setPublicSize('M');
  };

  const handleWhatsAppSubmit = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please fill out your Name and Phone Number to complete the order.');
      return;
    }
    if (serviceMethod === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter your Delivery Address/Hostel Name.');
      return;
    }

    const total = publicCart.reduce((sum, item) => sum + item.totalPrice, 0);
    let messageText = `🔔 *Bells Kitchen - New Online Order* 🔔\n`;
    messageText += `----------------------------------\n`;
    messageText += `*Customer Details:*\n`;
    messageText += `• Name: ${customerName.trim()}\n`;
    messageText += `• Phone: ${customerPhone.trim()}\n`;
    messageText += `• Method: ${serviceMethod === 'takeaway' ? '🚶 Takeaway (KNUST Counter)' : '🛵 Delivery'}\n`;
    if (serviceMethod === 'delivery') {
      messageText += `• Address: ${deliveryAddress.trim()}\n`;
    }
    messageText += `\n*Order Details:*\n`;

    publicCart.forEach(item => {
      messageText += `• ${item.quantity}x ${item.item.name} (${item.size})\n`;
      if (item.addons.length > 0) {
        messageText += `  Add-ons: ${item.addons.map((a: any) => a.name).join(', ')}\n`;
      }
    });

    messageText += `\n*Estimated Total:* GH₵ ${total.toFixed(2)}\n`;
    messageText += `----------------------------------\n`;
    messageText += `Thank you for ordering from Bells Kitchen!`;

    const whatsappNum = '233505201685';
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(messageText)}`;

    window.open(url, '_blank');

    setPublicCart([]);
    setIsPublicCartOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
  };

  // Dynamic reviews list
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1', name: 'Kwame Asante', role: 'Food Blogger', rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      title: 'Best Jollof in Kumasi!',
      text: 'Bells Kitchen Jollof Rice has become my absolute favorite. The rice is perfectly cooked, smoky, and full of rich aromatic spices. Highly recommended!',
      dish: 'Jollof Rice', date: '2 days ago', verified: true
    },
    {
      id: 'rev-2', name: 'Sarah Osei', role: 'Hospitality Critic', rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      title: 'Perfect Tilapia & Banku',
      text: 'The grilled tilapia is seasoned inside-out and grilled to tender perfection. Pairing it with fresh hot banku and the shito is unmatched.',
      dish: 'Banku & Tilapia', date: '1 week ago', verified: true
    },
    {
      id: 'rev-3', name: 'Emmanuel Mensah', role: 'KNUST Student', rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      title: 'Incredible Fried Rice!',
      text: 'Their Fried Rice is so flavorful and fresh. Never oily, with lots of fresh veggies. It is my go-to lunch on campus!',
      dish: 'Fried Rice', date: '2 weeks ago', verified: true
    },
    {
      id: 'rev-4', name: 'Abena Boateng', role: 'Local Foodie', rating: 5,
      avatarUrl: '',
      title: 'Mixture is the best combo',
      text: 'Can\'t decide between Jollof and Fried Rice? Get the Mixture! You get both on one plate. Truly the best of both worlds.',
      dish: 'Mixture', date: '3 weeks ago', verified: true
    },
    {
      id: 'rev-5', name: 'Michael Ofori', role: 'Regular Diner', rating: 5,
      avatarUrl: '',
      title: 'Deluxe Asorted Jollof',
      text: 'The Asorted Jollof Rice is loaded with beef, chicken, and sausages. Every bite is packed with protein and smoky goodness.',
      dish: 'Asorted Jollof Rice', date: '1 month ago', verified: true
    },
    {
      id: 'rev-6', name: 'Anita Mensah', role: 'Tech Manager', rating: 4,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      title: 'Hearty Asorted Fried Rice',
      text: 'Ordered the Asorted Fried Rice for our team lunch. Extremely generous portions, fully loaded with meat and veggies. Super satisfying!',
      dish: 'Asorted Fried Rice', date: '1 month ago', verified: true
    }
  ]);

  const ratingCounts = useMemo(() => {
    const counts = { all: reviewsList.length, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach(rev => {
      const r = rev.rating as 5 | 4 | 3 | 2 | 1;
      if (counts[r] !== undefined) {
        counts[r]++;
      }
    });
    return counts;
  }, [reviewsList]);

  const ratingPercentages = useMemo(() => {
    const total = reviewsList.length || 1;
    const star5 = reviewsList.filter(r => r.rating === 5).length;
    const star4 = reviewsList.filter(r => r.rating === 4).length;
    const star3 = reviewsList.filter(r => r.rating === 3).length;
    const star2 = reviewsList.filter(r => r.rating === 2).length;
    const star1 = reviewsList.filter(r => r.rating === 1).length;
    return {
      5: Math.round((star5 / total) * 100),
      4: Math.round((star4 / total) * 100),
      3: Math.round((star3 / total) * 100),
      2: Math.round((star2 / total) * 100),
      1: Math.round((star1 / total) * 100),
    };
  }, [reviewsList]);

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-red-600 to-orange-500',
      'from-orange-600 to-amber-500',
      'from-amber-600 to-yellow-500',
      'from-rose-600 to-pink-500',
      'from-red-800 to-orange-600',
      'from-orange-700 to-red-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const filteredReviews = useMemo(() => {
    return reviewsList.filter(rev => {
      const matchesRating = ratingFilter === 'all' || rev.rating.toString() === ratingFilter;
      const matchesDish = dishFilter === 'all' || rev.dish === dishFilter;
      return matchesRating && matchesDish;
    });
  }, [reviewsList, ratingFilter, dishFilter]);

  const handleHelpfulClick = (reviewId: string) => {
    if (upvotedReviews.includes(reviewId)) {
      setUpvotedReviews(prev => prev.filter(id => id !== reviewId));
      setHelpfulVotes(prev => ({
        ...prev,
        [reviewId]: Math.max(0, (prev[reviewId] || 0) - 1)
      }));
    } else {
      setUpvotedReviews(prev => [...prev, reviewId]);
      setHelpfulVotes(prev => ({
        ...prev,
        [reviewId]: (prev[reviewId] || 0) + 1
      }));
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewTitle.trim() || !reviewText.trim()) return;
    const newId = `rev-${Date.now()}`;
    // Strip emoji if present in the dish value
    const cleanedDish = reviewDish.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
    const newReview = {
      id: newId, name: reviewName.trim(), role: reviewRole.trim() || 'Diner',
      rating: reviewRating,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      title: reviewTitle.trim(), text: reviewText.trim(), dish: cleanedDish,
      date: 'Just now', verified: false
    };
    setReviewsList([newReview, ...reviewsList]);
    setHelpfulVotes(prev => ({ ...prev, [newId]: 0 }));
    setReviewSuccess(true);
    setReviewName(''); setReviewTitle(''); setReviewText('');
    setReviewRating(5); setReviewRole('Local Foodie');
    setTimeout(() => { setReviewSuccess(false); setIsWriteReviewOpen(false); }, 2000);
  };

  const landingMenu = [
    {
      id: 'item_002', name: 'Jollof Rice', category: 'mains',
      description: 'Rich, traditional party-style Jollof rice cooked in a seasoned, aromatic tomato and pepper broth. Best served with your choice of protein and sides.',
      price: 'GH₵ 40.00', prices: { S: 35, M: 40, L: 45 }, rating: 4.9, reviews: 142, badge: 'Bestseller', tag: 'Chef Special',
      imageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=800',
      accentColor: 'from-red-600 to-orange-500', badgeBg: 'bg-red-600'
    },
    {
      id: 'item_001', name: 'Fried Rice', category: 'mains',
      description: 'Savory wok-fired Fried Rice tossed with fresh carrots, green peas, spring onions, and local spices.',
      price: 'GH₵ 40.00', prices: { S: 35, M: 40, L: 45 }, rating: 4.8, reviews: 115, badge: 'Popular', tag: 'Wok Fired',
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-685f5888a3e1?auto=format&fit=crop&q=80&w=800',
      accentColor: 'from-amber-600 to-yellow-500', badgeBg: 'bg-amber-600'
    },
    {
      id: 'item_003', name: 'Mixture', category: 'mains',
      description: 'The perfect half-and-half combination! Enjoy equal parts of our signature Jollof Rice and savory Fried Rice in a single plate.',
      price: 'GH₵ 40.00', prices: { S: 35, M: 40, L: 45 }, rating: 4.7, reviews: 94, badge: 'Combo', tag: 'Best of Both',
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800',
      accentColor: 'from-orange-700 to-red-500', badgeBg: 'bg-orange-700'
    },
    {
      id: 'item_004', name: 'Banku & Tilapia', category: 'mains',
      description: 'Freshly grilled whole Tilapia fish seasoned in local herbs, served alongside hot fermented corn & cassava dumplings (Banku), fresh pepper sauce, and black shito.',
      price: 'GH₵ 65.00', prices: { S: 60, M: 65, L: 70 }, rating: 5.0, reviews: 198, badge: 'Premium', tag: 'Charcoal Grilled',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
      accentColor: 'from-yellow-600 to-amber-500', badgeBg: 'bg-yellow-600'
    },
    {
      id: 'item_005', name: 'Asorted Fried Rice', category: 'mains',
      description: 'Rich and hearty wok-fired Fried Rice loaded with a combination of tender beef chunks, chicken pieces, sausages, and fresh vegetables.',
      price: 'GH₵ 65.00', prices: { S: 60, M: 65, L: 70 }, rating: 4.9, reviews: 160, badge: 'Deluxe', tag: 'Meat Lover',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800',
      accentColor: 'from-rose-700 to-pink-500', badgeBg: 'bg-rose-700'
    },
    {
      id: 'item_006', name: 'Asorted Jollof Rice', category: 'mains',
      description: 'Our famous party Jollof rice tossed with sliced beef, diced chicken, and sausages for a loaded, savory, and protein-packed Ghanaian classic.',
      price: 'GH₵ 65.00', prices: { S: 60, M: 65, L: 70 }, rating: 4.9, reviews: 182, badge: 'Bestseller', tag: 'Crowd Favorite',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=800',
      accentColor: 'from-red-800 to-orange-600', badgeBg: 'bg-red-800'
    }
  ];

  const filteredMenu = useMemo(() => {
    return landingMenu.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) { setError('Please enter your email or phone number.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    setTimeout(() => {
      const user = state.staff.find(
        (member) => member.emailOrPhone.toLowerCase() === identifier.trim().toLowerCase() && member.passwordHash === password
      );
      if (user) {
        dispatch({ type: 'LOGIN_USER', payload: user });
        setIsLoginOpen(false);
      } else {
        setError('Incorrect email, phone number, or password. Access is restricted to authorized cashiers.');
      }
      setLoading(false);
    }, 850);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-dark-950 font-sans overflow-y-auto select-none relative pb-0">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#b91c1c]/95 backdrop-blur-md py-4 border-b border-red-900/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md">
              <span className="text-xl">🔔</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white leading-none">Bells Kitchen</span>
              <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider mt-1">Total Food Care</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7">
            {['Home', 'Menu', 'About', 'Branches', 'Reviews'].map((item, i) => (
              <a key={item} href={['#', '#explore-menu', '#why-choose', '#branches', '#testimonials'][i]}
                className={`font-bold text-xs uppercase transition-colors ${i === 0 ? 'text-amber-300' : 'text-white/90 hover:text-amber-300'}`}>
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="tel:+233302810990" className="hidden sm:flex items-center gap-1.5 font-black text-xs text-white">
              <Phone size={13} className="text-amber-300" />
              <span>+233 302 810 990</span>
            </a>
            <button onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#7f1d1d] transition-all text-xs font-black shadow-md hover:scale-105">
              <Lock size={12} />
              Terminal Portal
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO — deep crimson + orange glow ─────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-24 pb-16"
        style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 40%, #c2410c 80%, #92400e 100%)' }}>
        {/* Warm glow orbs */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }} />

        {/* Floating emojis */}
        <div className="absolute top-32 left-12 text-5xl opacity-20 animate-bounce hidden md:block" style={{ animationDuration: '3s' }}>🍗</div>
        <div className="absolute bottom-32 right-16 text-4xl opacity-15 animate-bounce hidden md:block" style={{ animationDuration: '4s', animationDelay: '1s' }}>🔥</div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-7 text-white text-center lg:text-left space-y-6">
              <span className="inline-block bg-amber-400 text-[#7f1d1d] px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg">
                🔥 Ghana's #1 Fast Food Experience
              </span>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.02] tracking-tight">
                Taste The<br />
                <span className="text-amber-400">Authentic</span><br />
                Ghanaian Flavor
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                From golden broasted crispy chicken to the famous smokey party Jollof rice — crafted with passion, served piping hot near KNUST.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <a href="#explore-menu"
                  className="inline-flex items-center justify-center gap-2 font-black text-sm uppercase bg-amber-400 hover:bg-amber-300 text-[#7f1d1d] shadow-xl hover:shadow-2xl hover:scale-105 h-14 rounded-2xl px-10 transition-all group">
                  Explore Menu
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <button onClick={() => setIsLoginOpen(true)}
                  className="inline-flex items-center justify-center gap-2 font-black text-sm uppercase border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-[#b91c1c] h-14 rounded-2xl px-10 transition-all">
                  Staff Terminal
                </button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20 max-w-md mx-auto lg:mx-0">
                <div><div className="text-3xl font-black text-amber-400">35+</div><div className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-1">Yrs Recipe</div></div>
                <div><div className="text-3xl font-black text-amber-400">50+</div><div className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-1">Staff Members</div></div>
                <div><div className="text-3xl font-black text-amber-400">1k+</div><div className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-1">Happy Diners</div></div>
              </div>
            </div>

            {/* Right — food image circle */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-[380px] sm:max-w-[420px] mx-auto">
                <div className="absolute inset-0 bg-amber-400/20 rounded-full filter blur-3xl animate-pulse" />
                <div className="absolute inset-4 bg-white rounded-full shadow-2xl overflow-hidden border-8 border-amber-400/30 group">
                  <img alt="Signature Crispy Chicken Jollof"
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-500"
                    src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=800" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#7f1d1d]/90 via-[#b91c1c]/50 to-transparent pt-12 pb-6 px-5 text-center z-10">
                    <h3 className="text-white font-black text-base md:text-lg tracking-tight">Crispy Jollof Chicken</h3>
                    <p className="text-amber-300 text-xs font-bold mt-0.5">Our Signature Dish</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
                      <span className="font-bold text-xs text-white ml-1.5">4.9</span>
                    </div>
                  </div>
                </div>
                {/* Pricing badge */}
                <div className="absolute right-0 top-1/4 bg-amber-400 text-[#7f1d1d] px-4 py-2.5 rounded-2xl shadow-xl z-20 hover:scale-105 transition-transform">
                  <div className="text-[8px] font-bold uppercase tracking-wider">Combo Deals</div>
                  <div className="text-lg font-black mt-0.5">GH₵ 45</div>
                </div>
                {/* Speed badge */}
                <div className="absolute left-[-10px] bottom-1/4 bg-white px-4 py-3 rounded-2xl shadow-xl z-20 hover:scale-105 transition-transform flex items-center gap-2 border border-red-100">
                  <Clock size={16} className="text-[#b91c1c]" />
                  <div className="text-left leading-none">
                    <span className="text-[10px] font-black text-dark-950 block">Quick Pick</span>
                    <span className="text-[8px] text-dark-500 font-bold mt-1 block">15 Min Serve</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU SECTION — near-black espresso with red/orange card accents ── */}
      <section id="explore-menu" className="py-24 scroll-mt-20 relative" style={{ background: '#1a0a06' }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to right,#ff000008 1px,transparent 1px),linear-gradient(to bottom,#ff000008 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="mb-14 text-center">
            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider flex items-center justify-center gap-1">
              <Flame size={12} className="text-amber-400 animate-pulse" /> ON THE COUNTER
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Our Popular Menu</h2>
            <p className="text-sm text-white/60 max-w-lg mx-auto mt-2">Discover our most loved dishes, crafted with passion and served piping hot near KNUST.</p>
            <div className="w-20 h-1 mt-4 rounded-full mx-auto bg-gradient-to-r from-red-600 to-amber-500" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-10 gap-4 border-b border-white/10">
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jollof, tilapia, sides…"
                className="w-full border focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/30 transition-all"
                style={{ background: '#2d1108', borderColor: '#4a1a0a' }} />
            </div>
            <div className="flex p-1 rounded-xl border overflow-x-auto" style={{ background: '#2d1108', borderColor: '#4a1a0a' }}>
              {(['all', 'mains'] as const).map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-red-700 text-white shadow-sm' : 'text-white/40 hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Cards */}
          {filteredMenu.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <div key={item.id}
                  className="rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(249,127,10,0.15)]"
                  style={{ background: 'linear-gradient(135deg, rgba(42, 14, 5, 0.75) 0%, rgba(26, 10, 6, 0.95) 100%)', border: '1px solid rgba(249, 127, 10, 0.15)' }}>
                  {/* Photo */}
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img src={item.imageUrl} alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${item.accentColor} opacity-20 group-hover:opacity-35 transition-opacity duration-300`} />
                    <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-xl text-white shadow-lg backdrop-blur-md border border-white/10 ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                  </div>
                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">{item.tag}</span>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-extrabold bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors duration-200">{item.name}</h3>
                      <p className="text-xs leading-relaxed mt-2" style={{ color: '#c49080' }}>{item.description}</p>
                    </div>
                    
                    <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(249, 127, 10, 0.15)' }}>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-white/45 leading-none mb-1">Price</span>
                        <span className="text-base font-black text-amber-400 leading-none">{item.price}</span>
                      </div>
                      <button onClick={() => setPendingPublicItem(item)}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#7f1d1d] bg-amber-400 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all shadow-md">
                        Order Now <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl" style={{ border: '1px dashed rgba(249, 127, 10, 0.25)', background: '#2a0e05' }}>
              <Utensils size={28} className="mx-auto text-white/20 mb-3" />
              <p className="text-xs text-white/30">No items match your filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE — burnt orange + chocolate brown background image ──────── */}
      <section id="why-choose" className="py-24 relative overflow-hidden text-white border-t border-black/20"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(42, 14, 5, 0.95) 0%, rgba(67, 20, 7, 0.92) 40%, rgba(124, 45, 18, 0.88) 80%, rgba(154, 52, 18, 0.85) 100%), url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}>
        <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 opacity-10 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="mb-16 text-center">
            <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider flex items-center justify-center gap-1">
              <Sparkles size={10} className="text-amber-300 fill-amber-300" /> THE BELLS PROMISE
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Why Choose Bells Kitchen?</h2>
            <p className="text-sm text-white/70 max-w-lg mx-auto mt-2">Experience the difference that has made our kitchen Ghana's beloved dining concept near KNUST.</p>
            <div className="w-20 h-1 mt-4 rounded-full mx-auto bg-amber-400" />
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left — photo */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative rounded-[32px] p-1 shadow-2xl overflow-hidden group" style={{ border: '1px solid rgba(251,191,36,0.2)' }}>
                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                  alt="Happy friends dining at Bells Kitchen" className="w-full h-auto object-cover rounded-[28px] border border-amber-400/10" />
                <div className="absolute top-4 right-4 bg-amber-400 text-[#431407] font-black text-[8px] uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md">
                  Vibrant Vibe & Taste
                </div>
              </div>
            </div>
            {/* Right — value cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: ChefHat, label: 'Expert Chefs', text: 'Our skilled chefs bring years of culinary expertise to authentic local recipes.', color: 'text-amber-300', border: 'hover:border-amber-400/40' },
                  { icon: Leaf, label: 'Fresh Ingredients', text: 'We source clean, premium local farm products and freshly caught tilapia daily.', color: 'text-emerald-300', border: 'hover:border-emerald-400/40' },
                  { icon: Clock, label: 'Express Service', text: 'Fast-casual counter collection workflows without compromising on taste.', color: 'text-orange-300', border: 'hover:border-orange-400/40' },
                  { icon: Award, label: 'Quality Assured', text: 'Strict sanitary standards, deep seasoning, and pristine presentation guides.', color: 'text-sky-300', border: 'hover:border-sky-400/40' },
                  { icon: Truck, label: 'Warm Packaging', text: 'Delivered inside heat-insulated biodegradable packs keeping meals piping hot.', color: 'text-blue-300', border: 'hover:border-blue-400/40' },
                  { icon: Heart, label: 'Made with Love', text: 'Every single box prepared with immense care, joy, and deep culinary passion.', color: 'text-rose-300', border: 'hover:border-rose-400/40' },
                ].map(({ icon: Icon, label, text, color, border }) => (
                  <div key={label} className={`p-5 rounded-2xl transition-all duration-300 group ${border}`}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon size={18} className={color} />
                      </div>
                      <h3 className={`text-xs font-black uppercase tracking-wider ${color}`}>{label}</h3>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY BANNER — full bleed image ───────────────────────── */}
      <div className="relative h-[420px] flex items-center justify-center overflow-hidden select-none">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=1200')" }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(127,29,29,0.95) 0%, rgba(180,60,10,0.7) 60%, transparent 100%)' }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full text-white text-left space-y-5">
          <span className="inline-block bg-amber-400 text-[#7f1d1d] font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
            🔥 Join The Bells Community
          </span>
          <h2 className="text-3xl md:text-5xl font-black max-w-lg leading-tight tracking-tight">
            Good Food, Good Vibes, Great Company
          </h2>
          <p className="text-xs md:text-sm text-white/90 max-w-md leading-relaxed font-medium">
            Serving students, families, and food lovers opposite No Weapon Hostel Annex. Stop by Kumasi's favorite counter today!
          </p>
        </div>
      </div>

      {/* ── TESTIMONIALS — High-End KFC / E-commerce Style Social Proof Board ── */}
      <section id="testimonials" className="py-24 scroll-mt-20 relative overflow-hidden bg-gradient-to-b from-[#1c0a04] via-[#0d0302] to-[#070100]">
        {/* Breathtaking Ambient Orbs */}
        <div className="absolute top-1/6 left-[-10%] w-[500px] h-[500px] opacity-25 pointer-events-none rounded-full filter blur-[120px] mix-blend-screen animate-pulse"
          style={{ background: 'radial-gradient(circle, #ffa02e 0%, transparent 70%)', animationDuration: '8s' }} />
        <div className="absolute bottom-1/6 right-[-10%] w-[600px] h-[600px] opacity-20 pointer-events-none rounded-full filter blur-[150px] mix-blend-screen animate-pulse"
          style={{ background: 'radial-gradient(circle, #b91c1c 0%, transparent 70%)', animationDuration: '10s', animationDelay: '2s' }} />
        
        {/* Subtle Overlay Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="mb-16 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest shadow-inner animate-pulse">
              <Sparkles size={11} className="fill-orange-400" /> Diner Feedback
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              What Our <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">Guests Experience</span>
            </h2>
            <p className="text-sm max-w-xl mx-auto font-medium text-amber-200/70 leading-relaxed">
              Explore authentic reviews from local food bloggers, KNUST students, and regulars about Bells Kitchen.
            </p>
            <div className="w-24 h-1.5 rounded-full mx-auto bg-gradient-to-r from-[#b91c1c] via-orange-500 to-amber-400 shadow-lg shadow-orange-500/20" />
          </div>

          {/* 12-Column Dashboard Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE PANEL (Span 4): Amazon/KFC style aggregates card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-[#2a0e05] to-[#170803] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-orange-500/25 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none"></div>
                
                <h3 className="text-amber-300/80 font-black text-xs tracking-wider uppercase mb-5 leading-none">Rating Summary</h3>
                
                <div className="text-center pb-6 border-b border-white/5">
                  <div className="text-6xl md:text-7xl font-black text-white tracking-tight flex items-baseline justify-center gap-1.5 drop-shadow-sm">
                    4.9
                    <span className="text-xl text-amber-200/50 font-bold">/5</span>
                  </div>
                  <div className="flex justify-center gap-1 text-amber-400 my-3.5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-amber-200/60 font-semibold">Based on 1.2k+ guest ratings</p>
                </div>

                {/* Rating Distribution Bars */}
                <div className="space-y-3.5 py-6 border-b border-white/5">
                  {([5, 4, 3, 2, 1] as const).map((star) => (
                    <div key={star} className="flex items-center justify-between text-[11px] text-amber-100/60 font-black gap-3 select-none">
                      <button 
                        onClick={() => setRatingFilter((ratingFilter === String(star) ? 'all' : String(star)) as any)}
                        className={`w-12 text-left shrink-0 hover:text-white transition-colors duration-150 flex items-center gap-1 ${ratingFilter === String(star) ? 'text-orange-400' : ''}`}
                      >
                        {star} Star{star > 1 ? 's' : ''}
                      </button>
                      <div className="flex-1 h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/5 relative">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] transition-all duration-500" 
                          style={{ width: `${ratingPercentages[star]}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right shrink-0 font-bold">{ratingPercentages[star]}%</span>
                    </div>
                  ))}
                </div>

                {/* Local Stats */}
                <div className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 border border-orange-500/10">
                      <Heart size={14} className="fill-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">98% Recommendation</h4>
                      <p className="text-[10px] text-amber-200/50 mt-0.5">Diners loved their customized chicken toppings.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/10">
                      <Award size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">Top Culinary Award</h4>
                      <p className="text-[10px] text-amber-200/50 mt-0.5">Voted best Smokey Jollof opposite No Weapon Annex.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl text-[#1c0a04] font-black text-xs shadow-lg transition-all active:scale-[0.98] hover:scale-[1.01] hover:shadow-orange-500/20 bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 duration-200"
                >
                  <Sparkles size={13} className="fill-[#1c0a04] animate-pulse" />
                  Leave a Dining Review
                </button>
              </div>
            </div>

            {/* RIGHT SIDE PANEL (Span 8): Review list with modern filters */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Filter Controls Row */}
              <div className="flex flex-col gap-4 bg-gradient-to-r from-[#2a0e05] to-[#1a0904] border border-white/5 rounded-3xl p-5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-300/60">Rating filter:</span>
                    <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/5 gap-0.5">
                      {(['all', '5', '4'] as const).map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setRatingFilter(star)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                            ratingFilter === star 
                              ? 'bg-gradient-to-r from-orange-500 to-[#b91c1c] text-white shadow-sm' 
                              : 'text-amber-100/55 hover:text-white'
                          }`}
                        >
                          {star === 'all' ? 'All Reviews' : `${star} Stars`}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setRatingFilter('all'); setDishFilter('all'); }}
                    className="text-[9px] font-black uppercase tracking-wider text-amber-400/70 hover:text-white transition-colors py-1 px-2.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="border-t border-white/5 pt-3.5">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-orange-500/25 scrollbar-track-transparent">
                    {[
                      { id: 'all', label: 'All Dishes', emoji: '🍛' },
                      { id: 'Jollof Rice', label: 'Jollof Rice', emoji: '🍚' },
                      { id: 'Fried Rice', label: 'Fried Rice', emoji: '🍳' },
                      { id: 'Mixture', label: 'Mixture Combo', emoji: '🍛' },
                      { id: 'Banku & Tilapia', label: 'Banku & Tilapia', emoji: '🐟' },
                      { id: 'Asorted Fried Rice', label: 'Assorted Fried', emoji: '🍲' },
                      { id: 'Asorted Jollof Rice', label: 'Assorted Jollof', emoji: '🔥' },
                    ].map(spec => {
                      const isActive = dishFilter === spec.id;
                      return (
                        <button
                          key={spec.id}
                          onClick={() => setDishFilter(spec.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-500 to-[#b91c1c] text-white border-orange-400/35 shadow-md shadow-orange-500/10 scale-105'
                              : 'bg-black/35 text-amber-100/60 border-white/5 hover:text-white hover:bg-black/60'
                          }`}
                        >
                          <span>{spec.emoji}</span>
                          <span>{spec.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review Cards Grid */}
              {filteredReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredReviews.map((rev) => (
                    <div 
                      key={rev.id}
                      className="bg-gradient-to-br from-[#2a0e05]/75 to-[#1c0a04]/90 border border-white/10 rounded-[2rem] p-6 shadow-xl hover:border-orange-500/30 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(249,127,10,0.12)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                    >
                      <div className="absolute -top-4 -right-1 text-8xl font-serif text-white/[0.02] select-none pointer-events-none group-hover:text-orange-500/[0.05] transition-colors duration-500">
                        ”
                      </div>

                      <div>
                        {/* Rating Row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex gap-0.5 text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          
                          {rev.verified ? (
                            <span className="flex items-center gap-1 text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                              <CheckCircle size={9} className="fill-emerald-400 text-[#120502]" /> Verified Diner
                            </span>
                          ) : (
                            <span className="text-[8px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                              Guest Diner
                            </span>
                          )}
                        </div>

                        {/* Title & Review Tag */}
                        <h4 className="text-[13px] font-black leading-snug text-white group-hover:text-amber-300 transition-colors duration-300">
                          {rev.title}
                        </h4>

                        <div className="inline-flex items-center gap-1.5 my-2.5 px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-orange-950/45 text-orange-300 border border-orange-500/15">
                          Ordered: {rev.dish}
                        </div>

                        {/* Text */}
                        <p className="text-[11px] leading-relaxed italic text-amber-100/80 mb-5 font-medium">
                          "{rev.text}"
                        </p>
                      </div>

                      {/* Footer / Author info */}
                      <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {rev.avatarUrl ? (
                            <img 
                              src={rev.avatarUrl} 
                              alt={rev.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/35 ring-offset-2 ring-offset-[#1c0a04] group-hover:scale-105 transition-transform duration-300 shadow-md"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-tr ${getAvatarGradient(rev.name)} ring-2 ring-orange-500/35 ring-offset-2 ring-offset-[#1c0a04] group-hover:scale-105 transition-transform duration-300 shadow-md`}>
                              {rev.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h5 className="text-[11.5px] font-black leading-none text-white">{rev.name}</h5>
                            <span className="text-[9px] font-bold block mt-1 text-amber-300/50 leading-none">{rev.role}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button
                            onClick={() => handleHelpfulClick(rev.id)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all select-none ${
                              upvotedReviews.includes(rev.id)
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                                : 'bg-white/5 text-amber-200/50 border-white/5 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20'
                            }`}
                          >
                            <ThumbsUp size={10} className={`transition-transform duration-200 ${upvotedReviews.includes(rev.id) ? 'scale-125 stroke-[3px]' : ''}`} />
                            <span>Helpful {helpfulVotes[rev.id] > 0 ? `(${helpfulVotes[rev.id]})` : ''}</span>
                          </button>
                          <span className="text-[8px] text-white/30 font-medium">{rev.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#2a0e05]/30 border border-dashed border-white/10 rounded-[2rem] shadow-inner select-none">
                  <Utensils size={28} className="mx-auto text-orange-500/30 mb-3 animate-pulse" />
                  <p className="text-xs text-amber-200/40 font-bold">No reviews found matching these options.</p>
                  <button 
                    onClick={() => { setRatingFilter('all'); setDishFilter('all'); }}
                    className="mt-3.5 text-[9px] text-amber-400 font-black uppercase tracking-widest hover:text-white hover:underline transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="mt-16 text-center">
            <p className="text-xs text-white/50">
              Have you dined at our KNUST counter?{' '}
              <button 
                onClick={() => setIsWriteReviewOpen(true)} 
                className="text-amber-400 hover:text-amber-300 font-black hover:underline transition-colors ml-1"
              >
                Share your dining experience
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ── BRANCHES — deep brown chocolate ───────────────────────────── */}
      <section id="branches" className="py-24 text-white relative select-none" style={{ background: '#1c0a04' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to right,#ffffff04 1px,transparent 1px),linear-gradient(to bottom,#ffffff04 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="mb-16 text-center">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <MapPin size={12} className="text-amber-400 animate-bounce" /> FIND US
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-1 text-white">Our Outlet Location</h2>
            <p className="text-sm max-w-lg mx-auto mt-2" style={{ color: '#a87060' }}>Visit us in Kumasi for the same authentic, fresh, and piping hot taste.</p>
            <div className="w-20 h-1 mt-4 rounded-full mx-auto bg-gradient-to-r from-red-600 to-amber-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Branch card */}
            <div className="lg:col-span-6 rounded-3xl p-8 flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-white">Bells Kitchen KNUST</h3>
                  <span className="text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full tracking-wider animate-pulse">Open</span>
                </div>
                <div className="space-y-4 text-xs text-white/80">
                  <p className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-semibold">Near KNUST, opposite No Weapon Hostel Annex, Kumasi</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone size={16} className="text-amber-400 flex-shrink-0" />
                    <span className="font-semibold">+233 302 810 990</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="block text-[10px] text-amber-400 uppercase font-black tracking-wider">Working Hours</strong>
                      <span className="block mt-0.5 font-medium">Mon – Sat: 9:00 AM – 10:00 PM</span>
                      <span className="block font-medium">Sun: 11:00 AM – 9:00 PM</span>
                    </span>
                  </p>
                </div>
              </div>
              <a href="tel:+233302810990"
                className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 font-black text-xs uppercase rounded-2xl shadow-md transition-all hover:scale-[1.01] text-[#431407]"
                style={{ background: '#f59e0b' }}>
                <Phone size={13} /> Call KNUST Counter
              </a>
            </div>
            {/* Right image */}
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-white/10 shadow-lg min-h-[300px]">
              <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800"
                alt="Bells Kitchen KNUST Counter Interior" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c0a04] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                <span className="text-[8px] text-white font-black uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: '#b91c1c' }}>Kumasi Outlet</span>
                <h4 className="text-sm font-black mt-2">Dine-In, Takeaway &amp; Delivery</h4>
                <p className="text-[10px] text-white/80 mt-1 font-medium leading-relaxed">
                  Located conveniently right opposite the No Weapon Hostel Annex — hot food right on campus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMO CTA — vivid crimson red ─────────────────────────────── */}
      <section className="py-20 text-center relative overflow-hidden" style={{ background: '#b91c1c' }}>
        <div className="absolute top-10 left-10 text-6xl opacity-15 pointer-events-none animate-pulse">🍗</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-15 pointer-events-none animate-pulse">🍟</div>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #fbbf24 0%, transparent 60%)' }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-6">
          <span className="inline-block bg-amber-400 text-[#7f1d1d] font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
            🎉 Limited Time Offer
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Hungry? Order Now &amp;<br />Get Free Delivery!
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Use checkout coupon code <span className="font-bold bg-[#7f1d1d] text-amber-300 px-3 py-1 rounded-md uppercase text-xs">BELLS2026</span> for free delivery on your first order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a href="#explore-menu"
              className="inline-flex items-center justify-center gap-2 font-black text-xs uppercase text-[#7f1d1d] shadow-md h-12 rounded-xl px-8 transition-all hover:scale-105"
              style={{ background: '#f59e0b' }}>
              Order Online
            </a>
            <a href="tel:+233302810990"
              className="inline-flex items-center justify-center gap-2 font-black text-xs uppercase border-2 border-white/50 bg-transparent text-white hover:bg-white hover:text-red-700 h-12 rounded-xl px-8 transition-all">
              Call to Order
            </a>
          </div>
          <p className="text-[10px] text-white/50">*Free delivery applies within 5km radius. Min order GH₵ 50.00.</p>
        </div>
      </section>

      {/* ── FOOTER — high-end dark chocolate with gold and crimson accents ── */}
      <footer className="text-white pt-20 pb-12 relative overflow-hidden bg-gradient-to-b from-[#0d0302] to-[#050100] border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] opacity-10 pointer-events-none rounded-full filter blur-[80px]"
          style={{ background: 'radial-gradient(circle, #ffa02e 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#b91c1c] to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <ChefHat size={20} className="text-white fill-white" />
              </div>
              <span className="text-lg font-black tracking-wider text-white">BELLS KITCHEN</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-200/60 font-medium">
              Ghana's modern dining concept. Preserving local cooking heritage with premium recipes, fast cashier service, and excellent customer care opposite No Weapon Annex.
            </p>
          </div>
          
          <div className="space-y-5">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2.5">
              <span className="w-6.5 h-0.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500" /> Quick Navigation
            </h3>
            <ul className="space-y-3 text-xs text-amber-100/70 font-semibold">
              {[
                ['Menu Catalog', '#explore-menu'],
                ['Why Choose Bells', '#why-choose'],
                ['Find Branch Outlet', '#branches'],
                ['Diner Reviews', '#testimonials']
              ].map(([label, href]) => (
                <li key={label} className="transition-transform duration-150 hover:translate-x-1">
                  <a href={href} className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                    <ChevronRight size={10} className="text-orange-500/50" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-5">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2.5">
              <span className="w-6.5 h-0.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500" /> Menu Highlights
            </h3>
            <ul className="space-y-3 text-xs text-amber-100/70 font-semibold">
              <li className="flex items-center gap-2">🍚 Jollof Rice</li>
              <li className="flex items-center gap-2">🍳 Fried Rice</li>
              <li className="flex items-center gap-2">🍛 Mixture Combo</li>
              <li className="flex items-center gap-2">🐟 Banku &amp; Tilapia</li>
            </ul>
          </div>
          
          <div className="space-y-5">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2.5">
              <span className="w-6.5 h-0.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500" /> Newsletter
            </h3>
            <p className="text-xs text-amber-200/60 font-medium">Get special weekend promo codes and discounts in your inbox.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address" required
                className="rounded-2xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none w-full border border-white/10 focus:ring-2 focus:ring-orange-500/40 focus:border-transparent transition-all"
                style={{ background: '#1c0a04' }} />
              <button type="submit" className="p-3 text-white rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 duration-200">
                <Send size={12} />
              </button>
            </form>
            {newsletterSubscribed && <p className="text-[10px] text-emerald-400 animate-pulse font-bold">✓ Thanks for subscribing!</p>}
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] font-black uppercase tracking-wider gap-4 border-t border-white/5 text-amber-200/30">
          <p>© {new Date().getFullYear()} Bells Kitchen. All rights reserved. Registered in Ghana.</p>
          <button onClick={() => setIsLoginOpen(true)} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-1 px-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/5 duration-150">
            <Lock size={9} /> Staff Portal Access
          </button>
        </div>
      </footer>

      {/* ── LOGIN OVERLAY ──────────────────────────────────────────────── */}
      {isLoginOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(13,3,2,0.88)' }}>
          <div className="w-full max-w-md rounded-[36px] shadow-2xl overflow-hidden animate-scale-in relative" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            {/* Status bar */}
            <div className="py-2.5 px-6 flex items-center justify-between text-[8px] font-mono tracking-widest text-white select-none" style={{ background: '#1c0a04' }}>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                SYS STATUS: SECURE CONNECTION
              </span>
              <span>DEV PORT: POS-5174</span>
            </div>

            {/* Close */}
            <button type="button" onClick={() => { setIsLoginOpen(false); setError(''); setIdentifier(''); setPassword(''); }}
              className="absolute top-16 right-4 p-2 rounded-xl transition-all" style={{ color: '#92400e', background: '#fed7aa' }}>
              <X size={16} />
            </button>

            {/* Modal header */}
            <div className="p-6 pb-2 text-center mt-6">
              <div className="w-12 h-9 rounded-lg mx-auto mb-4 opacity-90 flex flex-col justify-between p-1.5"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706, #f59e0b)', border: '1px solid rgba(180,83,9,0.3)' }}>
                <div className="flex justify-between">
                  <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(120,53,15,0.25)' }} />
                  <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(120,53,15,0.25)' }} />
                </div>
                <div className="h-[1px] w-full" style={{ background: 'rgba(120,53,15,0.25)' }} />
                <div className="flex justify-between">
                  <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(120,53,15,0.25)' }} />
                  <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(120,53,15,0.25)' }} />
                </div>
              </div>
              <h2 className="text-lg font-black tracking-tight" style={{ color: '#431407' }}>Staff Keycard Portal</h2>
              <p className="text-xs mt-1" style={{ color: '#92400e' }}>Authorized POS cashiers and administrators only.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="p-6 pt-3 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-700 animate-bounce-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                  <div><span className="font-black">Authorization Failed:</span> {error}</div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: '#92400e' }}>
                  <Mail size={11} className="text-red-700" /> Terminal Username (Email or Phone)
                </label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@bells.com or 024XXXXXXX" autoFocus
                  className="w-full rounded-2xl px-4 py-3.5 text-xs outline-none transition-all shadow-inner focus:ring-2"
                  style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#431407' }} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: '#92400e' }}>
                  <Lock size={11} className="text-red-700" /> Terminal PIN Password
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl px-4 py-3.5 text-xs outline-none transition-all shadow-inner"
                    style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#431407' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors" style={{ color: '#92400e' }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-xs font-black tracking-wider uppercase transition-all shadow-md hover:shadow-lg active:scale-98 mt-3 disabled:opacity-50"
                style={{ background: '#b91c1c' }}>
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Insert Keycard &amp; Auth <ArrowRight size={14} /></>}
              </button>
            </form>

            {/* Hint */}
            <div className="px-6 py-4 text-center select-none" style={{ background: '#1c0a04', borderTop: '1px solid #3d1508' }}>
              <p className="text-[9px] font-mono" style={{ color: '#6b3020' }}>
                CASHIER AUTH: cashier@bells.com / cashier123<br />
                ADMIN AUTH: admin@bells.com / admin123
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Public Cart Button */}
      {!state.currentUser && publicCart.length > 0 && (
        <button
          onClick={() => setIsPublicCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-[#b91c1c] text-white p-4.5 rounded-2xl shadow-2xl flex items-center gap-2.5 font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all border border-orange-400/25 animate-bounce-sm"
        >
          <span className="relative flex h-5 w-5 bg-white text-[#b91c1c] rounded-full items-center justify-center text-[10px] font-black">
            {publicCart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
          <span>View My Order</span>
          <ArrowRight size={14} />
        </button>
      )}

      {/* Public Order Config modal */}
      {pendingPublicItem && (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(13,3,2,0.88)' }}>
          <div className="w-full max-w-md rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden animate-scale-in relative border border-white/10"
            style={{ background: 'linear-gradient(135deg, #2a0e05 0%, #1c0a04 100%)' }}>
            
            <button type="button" onClick={() => setPendingPublicItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-amber-200/50 hover:text-white hover:bg-white/5 transition-all">
              <X size={16} />
            </button>
            
            <div className="p-6 pb-4 border-b border-white/5 mt-4">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                {pendingPublicItem.tag}
              </span>
              <h2 className="text-xl font-black text-white mt-2">{pendingPublicItem.name}</h2>
              <p className="text-xs text-amber-200/60 mt-1">{pendingPublicItem.description}</p>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Size Selection */}
              {pendingPublicItem.category !== 'drinks' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider block text-amber-300/80">Select Size</label>
                  <div className="flex gap-2">
                    {(['S', 'M', 'L'] as const).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPublicSize(sz)}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase transition-all border ${
                          publicSize === sz
                            ? 'bg-gradient-to-r from-orange-500 to-[#b91c1c] text-white border-orange-400/35 shadow-md shadow-orange-500/10 scale-105'
                            : 'bg-[#1c0a04] text-amber-100/60 border-white/10 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {sz === 'S' ? `Small (S) - GH₵ ${pendingPublicItem.prices?.S ?? (parseFloat(pendingPublicItem.price.replace(/[^\d.]/g, '')) - 5)}` :
                         sz === 'M' ? `Medium (M) - GH₵ ${pendingPublicItem.prices?.M ?? parseFloat(pendingPublicItem.price.replace(/[^\d.]/g, ''))}` :
                         `Large (L) - GH₵ ${pendingPublicItem.prices?.L ?? (parseFloat(pendingPublicItem.price.replace(/[^\d.]/g, '')) + 10)}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Addons Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider block text-amber-300/80">Customize Order (Add-ons)</label>
                <div className="grid grid-cols-2 gap-2">
                  {publicAddonOptions.map(addon => {
                    const isChecked = publicAddons.some(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setPublicAddons(publicAddons.filter(a => a.id !== addon.id));
                          } else {
                            setPublicAddons([...publicAddons, addon]);
                          }
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between text-xs font-bold leading-none ${
                          isChecked
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/40'
                            : 'bg-[#1c0a04] text-amber-100/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span>{addon.name}</span>
                        <span className="text-[10px] text-amber-400">+¢{addon.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Quantity Select on the subtotal row to save space */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Subtotal</p>
                  <p className="text-xl font-black text-white mt-0.5">
                    GH₵{(getPublicItemPrice(pendingPublicItem, publicSize, publicAddons) * publicQty).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-[#1c0a04] border border-white/10 rounded-2xl p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setPublicQty(Math.max(1, publicQty - 1))}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl font-bold transition-all active:scale-90"
                  >
                    <Minus size={11} strokeWidth={2.5} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={publicQty === 0 ? '' : publicQty}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setPublicQty(0);
                      } else {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 0) setPublicQty(val);
                      }
                    }}
                    onBlur={() => {
                      if (publicQty <= 0) setPublicQty(1);
                    }}
                    className="font-extrabold text-amber-300 text-xs w-9 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPublicQty(publicQty + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl font-bold transition-all active:scale-90"
                  >
                    <Plus size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              
              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddPublicCart}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[#1c0a04] text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 duration-200 mt-2"
              >
                <span>Add to Order</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Cart Drawer */}
      {isPublicCartOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(13,3,2,0.88)' }}>
          <div className="w-full max-w-lg rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden animate-scale-in relative border border-white/10 flex flex-col max-h-[90vh]"
            style={{ background: 'linear-gradient(135deg, #2a0e05 0%, #1c0a04 100%)' }}>
            
            <button type="button" onClick={() => setIsPublicCartOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-amber-200/50 hover:text-white hover:bg-white/5 transition-all">
              <X size={16} />
            </button>
            
            <div className="p-6 border-b border-white/5 mt-4 flex-shrink-0">
              <h2 className="text-xl font-black text-white">Your Culinary Selection</h2>
              <p className="text-xs text-amber-300/60 mt-1">Review your items and send the order to us via WhatsApp.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Item List */}
              <div className="space-y-3">
                {publicCart.map(item => (
                  <div key={item.cartItemId} className="bg-[#1c0a04] rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-white">{item.item.name} ({item.size})</h4>
                        {item.addons.length > 0 && (
                          <p className="text-[10px] text-amber-200/50 mt-0.5 leading-normal">
                            + {item.addons.map((a: any) => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-black text-amber-400">GH₵{item.totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
                      <button
                        type="button"
                        onClick={() => setPublicCart(publicCart.filter(c => c.cartItemId !== item.cartItemId))}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                      
                      <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl p-0.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = Math.max(1, item.quantity - 1);
                            setPublicCart(publicCart.map(c => c.cartItemId === item.cartItemId ? { ...c, quantity: newQty, totalPrice: c.unitPrice * newQty } : c));
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold text-xs"
                        >
                          <Minus size={10} strokeWidth={2.5} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => {
                            if (e.target.value === '') {
                              setPublicCart(publicCart.map(c => c.cartItemId === item.cartItemId ? { ...c, quantity: 0, totalPrice: 0 } : c));
                            } else {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 0) {
                                setPublicCart(publicCart.map(c => c.cartItemId === item.cartItemId ? { ...c, quantity: val, totalPrice: c.unitPrice * val } : c));
                              }
                            }
                          }}
                          onBlur={() => {
                            if (item.quantity <= 0) {
                              setPublicCart(publicCart.filter(c => c.cartItemId !== item.cartItemId));
                            }
                          }}
                          className="font-extrabold text-amber-300 text-xs w-8 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = item.quantity + 1;
                            setPublicCart(publicCart.map(c => c.cartItemId === item.cartItemId ? { ...c, quantity: newQty, totalPrice: c.unitPrice * newQty } : c));
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold text-xs"
                        >
                          <Plus size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order total */}
              <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest">Subtotal Amount</span>
                <span className="text-xl font-black text-white">GH₵{publicCart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
              </div>
              
              {/* Customer Info Form */}
              <div className="space-y-3.5 border-t border-white/5 pt-4">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-5 h-0.5 bg-orange-500 rounded-full" /> Delivery Details
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider block text-amber-300/80">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Asante"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-2xl px-4 py-2.5 text-xs outline-none transition-all bg-[#1c0a04] border border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-orange-500/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider block text-amber-300/80">Your Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0244123456"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-2xl px-4 py-2.5 text-xs outline-none transition-all bg-[#1c0a04] border border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-orange-500/40"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider block text-amber-300/80">Order Method</label>
                  <div className="flex gap-2">
                    {(['takeaway', 'delivery'] as const).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setServiceMethod(method)}
                        className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border ${
                          serviceMethod === method
                            ? 'bg-gradient-to-r from-orange-500 to-[#b91c1c] text-white border-orange-400/35 shadow-md scale-[1.01]'
                            : 'bg-[#1c0a04] text-amber-100/60 border-white/10 hover:text-white'
                        }`}
                      >
                        {method === 'takeaway' ? '🚶 Takeaway (KNUST Counter)' : '🛵 Delivery to Campus'}
                      </button>
                    ))}
                  </div>
                </div>
                
                {serviceMethod === 'delivery' && (
                  <div className="space-y-1 animate-slide-up">
                    <label className="text-[9px] font-bold uppercase tracking-wider block text-amber-300/80">Delivery Address / KNUST Hostel Name</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. No Weapon Hostel Annex, Room 302, opposite Annex Gate"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-2xl px-4 py-2.5 text-xs outline-none transition-all bg-[#1c0a04] border border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-orange-500/40 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit drawer footer */}
            <div className="p-6 border-t border-white/5 flex-shrink-0">
              <button
                type="button"
                onClick={handleWhatsAppSubmit}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg active:scale-[0.98] hover:scale-[1.01] bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10"
              >
                <span>💬 Send Order via WhatsApp</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WRITE A REVIEW MODAL ───────────────────────────────────────── */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(13,3,2,0.88)' }}>
          <div className="w-full max-w-md rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden animate-scale-in relative border border-white/10"
            style={{ background: 'linear-gradient(135deg, #2a0e05 0%, #1c0a04 100%)' }}>
            
            <button type="button" onClick={() => { setIsWriteReviewOpen(false); setReviewSuccess(false); }}
              className="absolute top-5 right-5 p-2 rounded-xl text-amber-200/50 hover:text-white hover:bg-white/5 transition-all">
              <X size={16} />
            </button>
            
            <div className="p-6 pb-4 text-center border-b border-white/5 mt-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 bg-gradient-to-tr from-[#b91c1c] to-orange-500">
                <Sparkles size={20} className="text-white fill-white animate-pulse" />
              </div>
              <h2 className="text-lg font-black text-white">Share Your Experience</h2>
              <p className="text-xs mt-1 text-amber-300/60">Let us know what you think about our food and service.</p>
            </div>

            {reviewSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle size={32} className="fill-emerald-400 text-[#1c0a04]" />
                </div>
                <h3 className="text-base font-black text-white">Review Submitted!</h3>
                <p className="text-xs leading-relaxed max-w-xs mx-auto text-amber-200/60">
                  Thank you! Your feedback has been successfully posted. Your review is now live on our board.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: 'Your Name', val: reviewName, set: setReviewName, placeholder: 'e.g. Kwame A.' },
                    { label: 'Your Role / Tag', val: reviewRole, set: setReviewRole, placeholder: 'e.g. Local Foodie' }].map(({ label, val, set, placeholder }) => (
                    <div key={label} className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider block text-amber-300/80">{label}</label>
                      <input type="text" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} required={label === 'Your Name'}
                        className="w-full rounded-2xl px-4 py-2.5 text-xs outline-none transition-all focus:ring-2 focus:ring-orange-500/40 bg-[#1c0a04] border border-white/10 text-white placeholder-white/20" />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider block text-amber-300/80">Rating (Stars)</label>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1 text-amber-500 transition-transform hover:scale-125">
                        <Star size={24} className={star <= reviewRating ? 'fill-amber-500 text-amber-500 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]' : 'text-white/10 hover:text-amber-500/50'} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-bold uppercase tracking-wider block text-amber-300/80">Favorite Dish Reviewed</label>
                  <div className="relative">
                    <select value={reviewDish} onChange={(e) => setReviewDish(e.target.value)}
                      className="w-full rounded-2xl px-4 py-2.5 text-xs outline-none transition-all cursor-pointer bg-[#1c0a04] border border-white/10 text-white appearance-none focus:ring-2 focus:ring-orange-500/40 font-bold">
                      <option className="bg-[#1c0a04] text-white">🍚 Jollof Rice</option>
                      <option className="bg-[#1c0a04] text-white">🍳 Fried Rice</option>
                      <option className="bg-[#1c0a04] text-white">🍛 Mixture</option>
                      <option className="bg-[#1c0a04] text-white">🐟 Banku & Tilapia</option>
                      <option className="bg-[#1c0a04] text-white">🍲 Asorted Fried Rice</option>
                      <option className="bg-[#1c0a04] text-white">🔥 Asorted Jollof Rice</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-[8px] font-bold">▼</div>
                  </div>
                </div>
                
                {[{ label: 'Review Headline', val: reviewTitle, set: setReviewTitle, placeholder: 'e.g. Incredibly delicious!', multiline: false },
                  { label: 'Your Review Description', val: reviewText, set: setReviewText, placeholder: 'Describe your experience: taste, seasoning, size…', multiline: true }].map(({ label, val, set, placeholder, multiline }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider block text-amber-300/80">{label}</label>
                    {multiline ? (
                      <textarea rows={3} required value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                        className="w-full rounded-2xl px-4 py-2.5 text-xs outline-none transition-all resize-none focus:ring-2 focus:ring-orange-500/40 bg-[#1c0a04] border border-white/10 text-white placeholder-white/20" />
                    ) : (
                      <input type="text" required value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                        className="w-full rounded-2xl px-4 py-2.5 text-xs outline-none transition-all focus:ring-2 focus:ring-orange-500/40 bg-[#1c0a04] border border-white/10 text-white placeholder-white/20" />
                    )}
                  </div>
                ))}
                
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[#1c0a04] text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 duration-200 mt-2">
                  <Send size={12} /> Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
