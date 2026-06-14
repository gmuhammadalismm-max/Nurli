import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Coffee, 
  ShoppingBag, 
  Users, 
  Clock, 
  Plus, 
  Minus, 
  Search, 
  Sparkles, 
  CheckCircle, 
  CalendarDays, 
  ArrowLeft, 
  Bell, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { Table, MenuItem, Order, Reservation, Language, OrderItem } from '../types';
import { TRANSLATIONS } from '../data';

interface CustomerPortalViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: 'USD' | 'UZS';
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  onAddOrder: (order: Omit<Order, 'id' | 'date' | 'time' | 'totalAmount'>) => void;
  onAddReservation: (resOmit: Omit<Reservation, 'id'>) => void;
  onExitMode: () => void;
}

export default function CustomerPortalView({
  language,
  setLanguage,
  currency,
  tables,
  menuItems,
  orders,
  reservations,
  onAddOrder,
  onAddReservation,
  onExitMode,
}: CustomerPortalViewProps) {
  const t = TRANSLATIONS[language];

  // Selected Table for the simulated sitting customer
  const [customerTableId, setCustomerTableId] = useState<string | null>(() => {
    return localStorage.getItem('lunor_customer_table_id') || null;
  });

  // Active view inside the client app
  const [portalTab, setPortalTab] = useState<'menu' | 'status' | 'reserve'>('menu');

  // Search and Category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'taomlar' | 'ichimliklar' | 'shirinliklar' | 'fastfood'>('all');

  // Shopping Cart state
  const [cart, setCart] = useState<{ menuItem: MenuItem; quantity: number }[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderSubmittedSuccess, setOrderSubmittedSuccess] = useState(false);

  // Reservation Form state
  const [bookName, setBookName] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookTableId, setBookTableId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookGuests, setBookGuests] = useState<number | string>(2);
  const [bookNotes, setBookNotes] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);

  // Waiter calling feedback
  const [waiterCalled, setWaiterCalled] = useState(false);

  const currencyRate = 12500;
  const formatMoney = (v: number) => {
    if (currency === 'UZS') {
      return v.toLocaleString(language === 'uz' ? 'uz-UZ' : 'en-US') + " UZS";
    }
    const inUSD = Math.round(v / currencyRate);
    return '$' + inUSD.toLocaleString('en-US');
  };

  const handleSelectTable = (id: string) => {
    setCustomerTableId(id);
    localStorage.setItem('lunor_customer_table_id', id);
  };

  // Switch tables or exit
  const handleResetTable = () => {
    setCustomerTableId(null);
    localStorage.removeItem('lunor_customer_table_id');
    setCart([]);
  };

  // Filter menu items based on availability and searches
  const filteredMenu = menuItems.filter((item) => {
    if (!item.isAvailable) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery.trim() !== '') {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             item.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Calculate cart sum
  const cartSum = cart.reduce((acc, cr) => acc + (cr.menuItem.price * cr.quantity), 0);
  const cartTotalItems = cart.reduce((acc, cr) => acc + cr.quantity, 0);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.menuItem.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (itemId: string, direction: 'up' | 'down') => {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci.menuItem.id === itemId);
      if (idx === -1) return prev;
      const next = [...prev];
      if (direction === 'up') {
        next[idx].quantity += 1;
      } else {
        if (next[idx].quantity > 1) {
          next[idx].quantity -= 1;
        } else {
          next.splice(idx, 1);
        }
      }
      return next;
    });
  };

  // Dispatch customer-facing order directly into the shared kitchen system
  const handlePlaceClientOrder = () => {
    if (!customerTableId) return;
    if (cart.length === 0) return;

    const chosenTable = tables.find(t => t.id === customerTableId);
    
    // Convert cart items to OrderItem format
    const billingItems: OrderItem[] = cart.map(c => ({
      menuItemId: c.menuItem.id,
      name: c.menuItem.name,
      price: c.menuItem.price,
      quantity: c.quantity
    }));

    onAddOrder({
      tableId: customerTableId,
      tableName: chosenTable?.name || 'Mobil Buyurtma',
      status: 'pending',
      waiterName: 'QR-SelfService',
      items: billingItems,
      notes: orderNotes ? `[Mijoz istagi]: ${orderNotes}` : 'Self-placed via QR Menu'
    });

    setCart([]);
    setOrderNotes('');
    setShowCartDrawer(false);
    setOrderSubmittedSuccess(true);
    setPortalTab('status');

    setTimeout(() => {
      setOrderSubmittedSuccess(false);
    }, 4500);
  };

  // Handle Client Reservations Submits
  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookName || !bookPhone || !bookTableId || !bookDate || !bookTime) {
      alert(language === 'uz' ? 'Iltimos barcha kerakli maydonlarni to\'ldiring.' : 'Please fill all required inputs.');
      return;
    }

    const matchedTable = tables.find(t => t.id === bookTableId);

    onAddReservation({
      customerName: bookName,
      customerPhone: bookPhone,
      tableId: bookTableId,
      tableName: matchedTable?.name || 'Stol',
      date: bookDate,
      time: bookTime,
      guestsCount: bookGuests,
      status: 'confirmed',
      notes: bookNotes
    });

    setBookSuccess(true);
    setTimeout(() => {
      setBookName('');
      setBookPhone('');
      setBookNotes('');
      setBookSuccess(false);
    }, 4000);
  };

  // Find active orders belonging to this selected table to track live cook updates
  const activeTableOrders = orders.filter(
    o => o.tableId === customerTableId && o.status !== 'paid' && o.status !== 'cancelled'
  );

  const getStatusBadge = (status: 'pending' | 'ready' | 'served' | 'paid' | 'cancelled') => {
    switch (status) {
      case 'pending': 
        return {
          titleUz: 'Oshxonada tayyorlanmoqda',
          titleEn: 'Preparing in Kitchen',
          descUz: 'Oshpazlarimiz taomingizni tayyorlashga kirishishdi.',
          descEn: 'Our chefs are busy preparing your delicate meals.',
          color: 'bg-amber-550 border-amber-500 text-amber-300'
        };
      case 'ready':
        return {
          titleUz: 'Buyurtma tayyor!',
          titleEn: 'Dishes are Ready!',
          descUz: 'Ofitsiant hozir taomlarni stolingizga yetkazadi.',
          descEn: 'Dishes have left the kitchen and are coming to your seat.',
          color: 'bg-indigo-650 border-indigo-400 text-indigo-300 animate-bounce'
        };
      case 'served':
        return {
          titleUz: 'Tortildi, yoqimli ishtaha!',
          titleEn: 'Served, Bon Appétit!',
          descUz: 'Sizga ajoyib taomlanish tajribasini tilaymiz.',
          descEn: 'We hope you enjoy your warm, freshly made meal.',
          color: 'bg-emerald-600 border-emerald-450 text-emerald-200'
        };
      default:
        return {
          titleUz: 'Tasdiqlanish kutilmoqda',
          titleEn: 'Awaiting dispatch',
          descUz: 'Kitchen team checks the order ticket.',
          descEn: 'Kitchen ticket generated successfully.',
          color: 'bg-zinc-800 border-zinc-700 text-zinc-300'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between font-sans leading-relaxed select-none overflow-x-hidden">
      
      {/* Simulation Control Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-[#121216] to-[#0d0d11] border-b border-zinc-900 py-2.5 px-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-amber-400 font-bold font-display uppercase tracking-wider text-[10px]">
            {language === 'uz' ? 'MIJOZLAR PORTALI (QR MENYU REJIM)' : 'CUSTOMER PORTAL (LIVE DECK MODE)'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Toggle inside Customer Portal */}
          <button 
            onClick={() => setLanguage(language === 'uz' ? 'en' : 'uz')}
            className="text-[10px] bg-zinc-900 px-2.5 py-1 text-zinc-400 rounded hover:text-white transition uppercase border border-zinc-800"
          >
            {language === 'uz' ? 'ENGLISH 🇺🇸' : 'O\'ZBEKCHA 🇺🇿'}
          </button>

          <button
            onClick={onExitMode}
            className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-amber-400 px-3 py-1 rounded transition duration-150 cursor-pointer font-sans font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'uz' ? 'Xodimlar tizimi' : 'Back to Admin'}</span>
          </button>
        </div>
      </div>

      {!customerTableId ? (
        /* TABLE SELECTION ENTRY POINT SCREEN */
        <div className="flex-1 max-w-md mx-auto w-full p-6 flex flex-col justify-center text-center space-y-6">
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4 relative shadow-2xl">
              <Utensils className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
              Lunor Gastro Lounge
            </h1>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {language === 'uz' 
                ? 'Stolingizdagi QR-kodni skan qildingiz deb hisoblang. Buyurtma berishni boshlash uchun o\'z stolingizni tanlang:'
                : 'Simulate scanning the table\'s QR Code. Choose your assigned dining table to look up the live menus and order:'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 text-left">
            {tables.length === 0 ? (
              <div className="col-span-full py-8 px-4 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40 space-y-3.5">
                <span className="text-zinc-500 text-xs italic block leading-relaxed">
                  {language === 'uz' 
                    ? "Hozircha tizimda stollar yaratilmagan. Xodimlar tizimiga qaytib, stollar xaritasidan birinchi stolni qo'shing."
                    : "No tables registered on the system yet. Return to the admin dashboard to add your first tables."}
                </span>
                <button
                  onClick={onExitMode}
                  className="px-4 py-1.5 bg-[#121214] border border-zinc-800 hover:border-zinc-700 text-amber-500 hover:text-amber-400 font-bold text-[10px] uppercase rounded-lg transition"
                >
                  ← {language === 'uz' ? 'Xodimlar tizimiga qaytish' : 'Back to Admin System'}
                </button>
              </div>
            ) : (
              tables.map((tbl) => (
                <button
                  key={tbl.id}
                  onClick={() => handleSelectTable(tbl.id)}
                  className="p-3 bg-[#111114] border border-zinc-850 hover:border-amber-400/50 rounded-xl transition duration-150 text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-white group-hover:text-amber-400 transition">
                      {tbl.name}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-mono">
                      {tbl.seatsCount} pax
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      tbl.status === 'free' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {tbl.status === 'free' ? (language === 'uz' ? 'Xozir bo\'sh' : 'Free Now') : (language === 'uz' ? 'Band' : 'Occupied')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-dashed border-zinc-900">
            <button
              onClick={() => {
                setLanguage(language === 'uz' ? 'en' : 'uz');
              }}
              className="text-xs text-zinc-500 hover:text-white transition underline"
            >
              {language === 'uz' ? 'Switch to English' : 'O\'zbek tiliga o\'tkazish'}
            </button>
          </div>
        </div>
      ) : (
        /* CUSTOMER LIVING TABLE VIEW MODULE */
        <div className="flex-1 flex flex-col justify-between">
          
          {/* Client Subsystem Sticky Sub-Header bar */}
          <div className="bg-[#0c0c10] border-b border-zinc-900/80 px-4 py-3 sticky top-0 z-40">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              
              <div className="flex items-center gap-2.5 text-left">
                <button
                  onClick={handleResetTable}
                  className="p-1.5 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-555 hover:text-white transition"
                  title="Switch Table"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-display font-bold text-sm text-white">
                      {tables.find(t => t.id === customerTableId)?.name || 'Table space'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">QR-Menu Session active</span>
                </div>
              </div>

              {/* Call Waiter & Action Alerts */}
              <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                  {waiterCalled ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-[9px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-1 rounded"
                    >
                      {language === 'uz' ? 'Chaqirildi! Ofitsiant yo\'lda' : 'Called! Waiter is on the way'}
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => {
                        setWaiterCalled(true);
                        setTimeout(() => setWaiterCalled(false), 3500);
                      }}
                      className="px-2.5 py-1 text-[10px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-zinc-300 font-bold rounded flex items-center gap-1 cursor-pointer transition uppercase"
                    >
                      <Bell className="w-3 h-3 text-amber-400" />
                      <span>{language === 'uz' ? 'Ofitsiantni chaqirish' : 'Call Waiter'}</span>
                    </button>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Sub Navigation Tabs for customers */}
          <div className="bg-[#0a0a0d] border-b border-zinc-900/40">
            <div className="max-w-2xl mx-auto grid grid-cols-3 text-center text-xs font-semibold">
              <button
                onClick={() => setPortalTab('menu')}
                className={`py-3 transition border-b-2 ${
                  portalTab === 'menu' 
                    ? 'border-amber-400 text-white font-bold bg-[#111116]/10' 
                    : 'border-transparent text-zinc-450 hover:text-white'
                }`}
              >
                🍽️ {language === 'uz' ? 'Taomlar Menusi' : 'Dishes Menu'}
              </button>

              <button
                onClick={() => setPortalTab('status')}
                className={`py-3 transition border-b-2 flex items-center justify-center gap-1.5 relative ${
                  portalTab === 'status' 
                    ? 'border-amber-400 text-white font-bold bg-[#111116]/10' 
                    : 'border-transparent text-zinc-455 hover:text-white'
                }`}
              >
                ⏱️ {language === 'uz' ? 'Buyurtmalarim' : 'My Orders'}
                {activeTableOrders.length > 0 && (
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                )}
              </button>

              <button
                onClick={() => setPortalTab('reserve')}
                className={`py-3 transition border-b-2 ${
                  portalTab === 'reserve' 
                    ? 'border-amber-400 text-white font-bold bg-[#111116]/10' 
                    : 'border-transparent text-zinc-450 hover:text-white'
                }`}
              >
                📅 {language === 'uz' ? 'Joy band qilish' : 'Reserve Table'}
              </button>
            </div>
          </div>

          {/* Tab Core Views Container */}
          <div className="flex-1 max-w-2xl mx-auto w-full p-4 pb-20">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: MENU CARD */}
              {portalTab === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  
                  {/* Category badging */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 pr-1 select-none no-scrollbar">
                    {(['all', 'taomlar', 'ichimliklar', 'shirinliklar', 'fastfood'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                          activeCategory === cat
                            ? 'bg-amber-400 border-transparent text-black font-semibold'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white'
                        }`}
                      >
                        {cat === 'all' 
                          ? (language === 'uz' ? 'Barchasi' : 'All') 
                          : t[cat] || cat}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-550 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={language === 'uz' ? 'Taomlarni ifor yoki nomi bo\'yicha qidirish...' : 'Search delicious recipes...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs bg-[#0c0c0f] border border-zinc-850 rounded-lg py-2 pl-9 pr-4 text-white outline-none focus:border-amber-400 placeholder-zinc-550 font-sans"
                    />
                  </div>

                  {orderSubmittedSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 leading-relaxed animate-pulse">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <strong>{language === 'uz' ? 'Buyurtmangiz oshxonaga qabul qilindi!' : 'Order received in the kitchen!'}</strong>
                        <span className="block text-[10px] text-zinc-400 mt-0.5">{language === 'uz' ? 'Uni "Buyurtmalarim" oynasida real vaqtda kuzatib boring.' : 'We are preparing your dishes now. Check updates.'}</span>
                      </div>
                    </div>
                  )}

                  {/* Food Items List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredMenu.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#111114] border border-zinc-850 rounded-xl flex flex-col justify-between hover:border-zinc-800 transition duration-150 relative text-left"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display font-bold text-xs text-white">
                              {item.name}
                            </h4>
                            <span className="text-amber-400 font-bold font-mono text-xs shrink-0 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-500/10">
                              {formatMoney(item.price)}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-zinc-450 leading-relaxed font-sans line-clamp-2">
                            {item.description || (language === 'uz' ? 'Ajoyib maza va sirlilikni o\'zida mujassam etgan haqiqiy san\'at asari.' : 'A handcrafted dish prepared daily with local fresh ingredients.')}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-zinc-900/40">
                          <span className="text-[9px] font-mono uppercase text-zinc-500 font-semibold">
                            {t[item.category] || item.category}
                          </span>
                          
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-350 text-black rounded font-bold text-[9px] uppercase cursor-pointer transition flex items-center gap-1 font-display"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>{language === 'uz' ? "Savatga qo'shish" : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredMenu.length === 0 && (
                      <div className="col-span-full py-16 text-center text-zinc-600 italic text-xs bg-zinc-900/5 rounded-xl border border-zinc-900 border-dashed">
                        {language === 'uz' ? 'Qidiruvga yoki kategoriya mos taom topilmadi.' : 'No available dishes found.'}
                      </div>
                    )}
                  </div>

                </motion.div>
              )}

              {/* TAB 2: LIVE LAUNCH STATUS MONITOR */}
              {portalTab === 'status' && (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
                    <Clock className="w-4.5 h-4.5 text-amber-500" />
                    <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                      {language === 'uz' ? 'Faol buyurtmalaringiz holati' : 'Real-time order statuses'}
                    </h3>
                  </div>

                  {activeTableOrders.length === 0 ? (
                    <div className="py-16 text-center border border-zinc-850 border-dashed rounded-xl space-y-3.5 bg-zinc-900/5">
                      <span className="text-zinc-500 text-xs block italic leading-relaxed px-5">
                        {language === 'uz' 
                          ? "Hali bu stol uchun faol buyurtmalar mavjud emas. Yuqoridagi 'Taomlar Menusi' sahfasidan o'zingiz xohlagan taomlarni savatga qo'shib buyurtma bering!"
                          : "You haven't placed any kitchen orders for this table during this sitting yet. Explore the menu and request some items."}
                      </span>
                      <button
                        onClick={() => setPortalTab('menu')}
                        className="px-4 py-1.5 bg-amber-400 text-black font-semibold uppercase text-[10px] rounded hover:bg-amber-300 transition"
                      >
                        {language === 'uz' ? 'Menyuni ko\'rish' : 'Browse Menu'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTableOrders.map((ord, idx) => {
                        const stateMeta = getStatusBadge(ord.status);
                        return (
                          <div 
                            key={ord.id}
                            className="bg-[#111114] border border-zinc-850 rounded-xl p-4 space-y-3 shadow-xl"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1 border-b border-zinc-900 pb-2.5">
                              <div>
                                <span className="text-[9px] text-zinc-550 font-mono">ORDER TICKET #{ord.id}</span>
                                <div className="text-[10px] text-zinc-350 font-sans tracking-tight">
                                  {language === 'uz' ? 'Yuborilgan vaqti' : 'Ordered at'}: <strong>{ord.time}</strong>
                                </div>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${stateMeta.color}`}>
                                {language === 'uz' ? stateMeta.titleUz : stateMeta.titleEn}
                              </span>
                            </div>

                            {/* Ticket items details */}
                            <div className="space-y-1.5 text-xs">
                              {ord.items.map((it, k) => (
                                <div key={k} className="flex justify-between items-center py-1 font-sans">
                                  <span className="text-zinc-350">
                                    {it.name} <strong className="text-amber-500 font-bold ml-1">x{it.quantity}</strong>
                                  </span>
                                  <span className="font-mono text-zinc-500">{formatMoney(it.price * it.quantity)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Progress feedback detail */}
                            <div className="bg-[#0b0b0e] p-2.5 rounded-lg border border-zinc-900/60 text-[10px] text-zinc-450 italic flex items-center gap-2">
                              <span className="text-amber-400">💡</span>
                              <span>{language === 'uz' ? stateMeta.descUz : stateMeta.descEn}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-zinc-900/40 mt-1 font-mono text-xs">
                              <span className="text-zinc-500">Subtotal amount:</span>
                              <strong className="text-amber-400 font-bold font-sans text-sm">
                                {formatMoney(ord.totalAmount)}
                              </strong>
                            </div>

                          </div>
                        );
                      })}

                      {/* Call cashier help */}
                      <div className="p-3 bg-amber-500/5 border border-amber-550/10 rounded-xl flex items-center justify-between text-xs gap-3">
                        <div className="text-left">
                          <span className="text-[10px] text-zinc-450 block">{language === 'uz' ? 'Hisobni yakunlamoqchimisiz?' : 'Ready to pay & leave?'}</span>
                          <span className="text-[9px] text-zinc-550 italic leading-none block mt-0.5">{language === 'uz' ? 'Ofitsiant sizga terminal yoki chek olib keladi.' : 'Alert waiters to settle standard invoice.'}</span>
                        </div>
                        <button
                          onClick={() => {
                            setWaiterCalled(true);
                            setTimeout(() => setWaiterCalled(false), 4000);
                          }}
                          className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-white hover:text-amber-400 font-bold text-[9px] uppercase rounded-lg border border-zinc-800 transition cursor-pointer"
                        >
                          💸 {language === 'uz' ? 'To\'lov so\'rash' : 'Request Check'}
                        </button>
                      </div>

                    </div>
                  )}

                </motion.div>
              )}

              {/* TAB 3: CLIENT TABLE RESERVATION FORM */}
              {portalTab === 'reserve' && (
                <motion.div
                  key="reserve"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
                    <CalendarDays className="w-4.5 h-4.5 text-amber-500" />
                    <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                      {language === 'uz' ? 'Kelajakda tashrif buyurish uchun stol band qiling' : 'Book a table for a future visit'}
                    </h3>
                  </div>

                  {bookSuccess ? (
                    <div className="py-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center space-y-3.5 p-4">
                      <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-display font-bold text-sm text-white">
                        {language === 'uz' ? 'Muvaffaqiyatli band qilindi!' : 'Reservation Submitted!'}
                      </h4>
                      <p className="text-zinc-450 text-xs px-2 max-w-sm mx-auto leading-relaxed">
                        {language === 'uz' 
                          ? 'Sizning broningiz muassasa kassa daftarida tasdiqlandi. Belgilangan vaqtda sizni intizorlik bilan kutamiz!'
                          : 'Your table booking has been instantly logged in the staff registry. We look forward to greeting you on arrival!'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReserveSubmit} className="bg-[#111114] border border-zinc-850 rounded-xl p-4 space-y-4 text-xs">
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                            {language === 'uz' ? 'Ismingiz' : 'Guest Name'} *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Masalan: Sardorbek"
                            value={bookName}
                            onChange={(e) => setBookName(e.target.value)}
                            className="w-full bg-[#0c0c0f] border border-zinc-850 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                            {language === 'uz' ? 'Telefon raqamingiz' : 'Phone Number'} *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Masalan: +998 90 123 4567"
                            value={bookPhone}
                            onChange={(e) => setBookPhone(e.target.value)}
                            className="w-full bg-[#0c0c0f] border border-zinc-850 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1 col-span-2">
                          <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                            {language === 'uz' ? 'Stolni tanlang' : 'Select Desired Table'} *
                          </label>
                          <select
                            required
                            value={bookTableId}
                            onChange={(e) => setBookTableId(e.target.value)}
                            className="w-full bg-[#0c0c0f] border border-zinc-850 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                          >
                            <option value="">{language === 'uz' ? 'Stol tanlash...' : 'Choose table...'}</option>
                            {tables.map(tb => (
                              <option key={tb.id} value={tb.id}>
                                {tb.name} ({tb.seatsCount} Pax)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                            {language === 'uz' ? 'Kishi soni (pax)' : 'Pax Count'}
                          </label>
                          <input
                            type="text"
                            value={bookGuests}
                            onChange={(e) => setBookGuests(e.target.value)}
                            className="w-full bg-[#0c0c0f] border border-zinc-850 p-2 text-white rounded outline-none focus:border-amber-400 font-sans text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                            {language === 'uz' ? 'Sana' : 'Visitation Date'} *
                          </label>
                          <input
                            type="date"
                            required
                            value={bookDate}
                            onChange={(e) => setBookDate(e.target.value)}
                            className="w-full bg-[#0c0c0f] border border-zinc-850 p-2 text-white rounded outline-none focus:border-amber-400 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                            {language === 'uz' ? 'Kelish vaqti' : 'Arrival Time'} *
                          </label>
                          <input
                            type="time"
                            required
                            value={bookTime}
                            onChange={(e) => setBookTime(e.target.value)}
                            className="w-full bg-[#0c0c0f] border border-zinc-850 p-2 text-white rounded outline-none focus:border-amber-400 font-mono text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                          {language === 'uz' ? 'Alohida istaklarimiz / Izoh' : 'Special Host Requests (Notes)'}
                        </label>
                        <textarea
                          placeholder={language === 'uz' ? 'Masalan: Tug\'ilgan kun bezagi bo\'lsin, chekka stol bo\'lsin...' : 'E.g., Window seat, vegetarian cutlery requests...'}
                          value={bookNotes}
                          onChange={(e) => setBookNotes(e.target.value)}
                          className="w-full h-16 bg-[#0c0c0f] border border-zinc-850 p-2 text-white rounded outline-none focus:border-amber-400 font-sans resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-400 hover:bg-amber-350 text-black font-extrabold uppercase rounded-lg font-sans transition tracking-widest text-[10px] cursor-pointer"
                      >
                        {language === 'uz' ? 'Xoziroq Band Qilish' : 'Confirm Reservation'}
                      </button>

                    </form>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Floating shopping cart visual bar on BOTTOM */}
          {portalTab === 'menu' && cart.length > 0 && (
            <div className="fixed bottom-0 inset-x-0 bg-transparent p-4 z-40">
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="w-full h-12 bg-amber-400 hover:bg-amber-350 text-black font-semibold rounded-xl flex items-center justify-between px-5 font-display shadow-2xl transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-2.5 bg-black/10 rounded-lg text-xs font-bold font-mono">
                      {cartTotalItems}
                    </div>
                    <span className="text-xs uppercase tracking-wider">{language === 'uz' ? 'Savatni ko\'rish' : 'View Cart'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-sans font-bold text-sm">
                    <span>{formatMoney(cartSum)}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-150" />
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================== CLIENT SHOPPING CART BOTTOM DRAWER ==================== */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-end justify-center z-[240]">
            
            {/* Clickable upper space to close */}
            <div className="absolute inset-0 z-0" onClick={() => setShowCartDrawer(false)} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-[#0e0e12] rounded-t-2xl border-t border-zinc-850 shadow-2xl z-10 flex flex-col max-h-[85vh] text-left relative"
            >
              
              {/* Drawer header */}
              <div className="p-4 border-b border-zinc-900 bg-black/15 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
                  <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                    {language === 'uz' ? 'Xarid Savatingiz' : 'Your Shopping Table Cart'}
                  </h4>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 rounded border border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold cursor-pointer"
                >
                  {language === 'uz' ? 'Yopish' : 'Close'}
                </button>
              </div>

              {/* Items in cart list */}
              <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-64 no-scrollbar">
                {cart.map((cartItem) => (
                  <div 
                    key={cartItem.menuItem.id} 
                    className="flex justify-between items-center bg-[#131317] p-2.5 rounded-xl border border-zinc-850"
                  >
                    <div className="space-y-0.5">
                      <strong className="text-white text-xs block">{cartItem.menuItem.name}</strong>
                      <span className="text-[10px] text-zinc-500 font-mono">{formatMoney(cartItem.menuItem.price)} / unit</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Qty controller buttons */}
                      <button
                        onClick={() => handleUpdateCartQty(cartItem.menuItem.id, 'down')}
                        className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-mono font-bold text-white w-5 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQty(cartItem.menuItem.id, 'up')}
                        className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      
                      <strong className="text-amber-400 font-mono text-xs w-20 text-right shrink-0">
                        {formatMoney(cartItem.menuItem.price * cartItem.quantity)}
                      </strong>

                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-6 text-zinc-550 italic text-xs">
                    {language === 'uz' ? 'Savat bo\'sh. Taom va ichimliklardan qo\'shing!' : 'Your table cart is empty.'}
                  </div>
                )}
              </div>

              {/* Cooking notes and dispatch */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-zinc-900 bg-[#0c0c0f] space-y-4">
                  
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">
                      {language === 'uz' ? 'Oshxonaga qo\'shimcha taklifingiz (Izoh)' : 'Kitchen Cooking Notes'}:
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'uz' ? 'Masalan: Choy shirin bo\'lmasin, somsa issiq bo\'lsin...' : 'E.g., No sauce, serve drinks immediately...'}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full bg-[#111114] border border-zinc-850 p-2.5 text-white rounded-lg outline-none focus:border-amber-400 text-xs font-sans"
                    />
                  </div>

                  <div className="space-y-4 pt-2 border-t border-zinc-900/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-550 font-mono uppercase">Grand total cost:</span>
                      <strong className="text-emerald-400 font-bold font-sans text-base">
                        {formatMoney(cartSum)}
                      </strong>
                    </div>

                    <button
                      onClick={handlePlaceClientOrder}
                      className="w-full h-11 bg-amber-400 hover:bg-amber-350 text-black font-extrabold uppercase rounded-xl transition tracking-wider text-[10px] flex items-center justify-center gap-2 cursor-pointer font-display"
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      <span>{language === 'uz' ? 'Buyurtmani Oshxonaga Yuborish' : 'Send Order to Kitchen'}</span>
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
