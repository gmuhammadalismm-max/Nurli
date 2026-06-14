import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  Search,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Plus,
  Compass,
  Utensils
} from 'lucide-react';
import { Table, MenuItem, Order, Reservation, Language } from './types';
import { 
  DEFAULT_TABLES,
  DEFAULT_MENU_ITEMS,
  DEFAULT_ORDERS,
  DEFAULT_RESERVATIONS,
  TRANSLATIONS 
} from './data';

// Import Views
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ContractsView from './components/ContractsView';
import TemplatesView from './components/TemplatesView'; // This is MenusView
import ClientsView from './components/ClientsView';     // This is ReservationsView
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import CustomerPortalView from './components/CustomerPortalView';

export default function App() {
  // Enforce clean layout reset once on mount for V5 Café
  const isResetDone = localStorage.getItem('lunor_cafe_reset_done_v5') === 'true';
  if (!isResetDone) {
    localStorage.removeItem('lunor_tables');
    localStorage.removeItem('lunor_menu_items');
    localStorage.removeItem('lunor_orders');
    localStorage.removeItem('lunor_reservations');
    // also clear legacy ones
    localStorage.removeItem('lunor_folders');
    localStorage.removeItem('lunor_clients');
    localStorage.removeItem('lunor_contracts');
    localStorage.setItem('lunor_cafe_reset_done_v5', 'true');
  }

  // Mobile Sidebar Drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Persistent State Hooks
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('lunor_lang');
    return (saved === 'uz' || saved === 'en') ? saved : 'uz';
  });

  const [currency, setCurrency] = useState<'USD' | 'UZS'>(() => {
    const saved = localStorage.getItem('lunor_currency');
    return (saved === 'USD' || saved === 'UZS') ? saved : 'UZS'; // Default to UZS
  });

  const [isPremium, setIsPremium] = useState<boolean>(() => {
    const saved = localStorage.getItem('lunor_premium');
    return saved === 'true';
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('lunor_user_name') || 'Sardorbek (Manager)';
  });

  const [companyName, setCompanyName] = useState<string>(() => {
    return localStorage.getItem('lunor_company_name') || 'Lunor Gastro';
  });

  // A one-time check to force a clean blank slate for the user's real input
  const [tables, setTables] = useState<Table[]>(() => {
    const wiped = localStorage.getItem('lunor_v6_wiped');
    if (wiped !== 'true') {
      localStorage.removeItem('lunor_tables_v5');
      localStorage.removeItem('lunor_menu_items_v5');
      localStorage.removeItem('lunor_orders_v5');
      localStorage.removeItem('lunor_reservations_v5');
      localStorage.setItem('lunor_v6_wiped', 'true');
      return [];
    }
    const saved = localStorage.getItem('lunor_tables_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('lunor_menu_items_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lunor_orders_v5');
    return saved ? JSON.parse(saved) : [];
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('lunor_reservations_v5');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCustomerMode, setIsCustomerMode] = useState<boolean>(() => {
    return localStorage.getItem('lunor_customer_mode') === 'true';
  });

  // Modal HUD controller triggers
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  // Upgrade card form mock states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccessCheck, setPaySuccessCheck] = useState(false);

  // Global Search Input
  const [globalQuery, setGlobalQuery] = useState('');

  // Sync state modifications to LocalStorage
  useEffect(() => {
    localStorage.setItem('lunor_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('lunor_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('lunor_premium', String(isPremium));
  }, [isPremium]);

  useEffect(() => {
    localStorage.setItem('lunor_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('lunor_company_name', companyName);
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem('lunor_tables_v5', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('lunor_menu_items_v5', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('lunor_orders_v5', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lunor_reservations_v5', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('lunor_customer_mode', String(isCustomerMode));
  }, [isCustomerMode]);

  // Global Key binding shortcut listener for search command '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const nodeName = (e.target as HTMLElement).nodeName;
      if (nodeName === 'INPUT' || nodeName === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const t = TRANSLATIONS[language];

  // Core callback features for Cafe actions:
  
  // 1. ADD STOL (Table)
  const handleAddTable = (name: string, seatsCount: number) => {
    const newTable: Table = {
      id: `tbl-${Date.now()}`,
      name,
      seatsCount,
      status: 'free',
      currentOrderValue: 0
    };
    setTables([...tables, newTable]);
  };

  const handleUpdateTable = (tableId: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(tb => {
      if (tb.id === tableId) {
        return {
          ...tb,
          ...updates
        };
      }
      return tb;
    }));
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(prev => prev.filter(tb => tb.id !== tableId));
  };

  // 2. CHANGE STOL STATUS (e.g. Free/Occupies)
  const handleChangeTableStatus = (tableId: string, status: 'free' | 'occupied' | 'reserved') => {
    setTables(prev => prev.map(tb => {
      if (tb.id === tableId) {
        return {
          ...tb,
          status,
          currentOrderValue: status === 'free' ? 0 : tb.currentOrderValue
        };
      }
      return tb;
    }));
  };

  // 3. CREATE NEW KITCHEN ORDER
  const handleAddOrder = (newOrdOmit: Omit<Order, 'id' | 'date' | 'time' | 'totalAmount'>) => {
    const orderSum = newOrdOmit.items.reduce((s, item) => s + (item.price * item.quantity), 0);
    const created: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalAmount: orderSum,
      ...newOrdOmit
    };

    setOrders([created, ...orders]);

    // Force linked Table status to occupied
    setTables(prev => prev.map(t => {
      if (t.id === created.tableId) {
        return { ...t, status: 'occupied', currentOrderValue: orderSum };
      }
      return t;
    }));
  };

  // 4. UPDATE CORE ORDER PROPERTIES (Preparing -> Serves -> Paid)
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const fullyUpdated = { ...o, ...updates };
        
        // If status becomes "paid", free up the Table!
        if (updates.status === 'paid') {
          handleChangeTableStatus(o.tableId, 'free');
        }

        return fullyUpdated;
      }
      return o;
    }));
  };

  // 5. DELETING BILLS
  const handleDeleteOrder = (id: string) => {
    const trg = orders.find(o => o.id === id);
    if (trg) {
      setOrders(orders.filter(o => o.id !== id));
      // Reset associated table status back to free
      handleChangeTableStatus(trg.tableId, 'free');
    }
  };

  // 6. ADD AND BOOK RESERVATIONS
  const handleAddReservation = (newResOmit: Omit<Reservation, 'id'>) => {
    const created: Reservation = {
      id: `res-${Date.now().toString().slice(-4)}`,
      ...newResOmit
    };

    const assignedTableId = newResOmit.tableId;

    setReservations([created, ...reservations]);

    // Set associated table status to Reserved
    setTables(prev => prev.map(tb => {
      if (tb.id === assignedTableId) {
        return { ...tb, status: 'reserved' };
      }
      return tb;
    }));
  };

  // 7. ADVANCING BOOKINGS (Mark as Seated)
  const handleUpdateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        const merged = { ...res, ...updates };

        // If guest arrived (attended), occupy their assigned table and open a blank kitchen ticket!
        if (updates.status === 'attended') {
          // 1. Mark table occupied
          handleChangeTableStatus(res.tableId, 'occupied');
          
          // 2. Open inline bill in kitchen instantly
          handleAddOrder({
            tableId: res.tableId,
            tableName: res.tableName,
            status: 'pending',
            waiterName: 'Sardor',
            items: [],
            notes: `Rezervasyon Keldi: "${res.notes || ''}"`
          });
        } else if (updates.status === 'cancelled') {
          // Set table as Free
          handleChangeTableStatus(res.tableId, 'free');
        }

        return merged;
      }
      return res;
    }));
  };

  // 8. REMOVING RESERVATIONS
  const handleDeleteReservation = (id: string) => {
    const trg = reservations.find(r => r.id === id);
    if (trg) {
      setReservations(reservations.filter(r => r.id !== id));
      handleChangeTableStatus(trg.tableId, 'free');
    }
  };

  // 9. MENU ITEMS MANAGEMENT
  const handleAddMenuItem = (itemOmit: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      id: `menu-${Date.now().toString().slice(-4)}`,
      ...itemOmit
    };
    setMenuItems([...menuItems, newItem]);
  };

  const handleUpdateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  // 10. CLEAR SIMULATIONS (Reset back to default seed)
  const handleClearMockData = () => {
    setTables(DEFAULT_TABLES);
    setMenuItems(DEFAULT_MENU_ITEMS);
    setOrders(DEFAULT_ORDERS);
    setReservations(DEFAULT_RESERVATIONS);
    setActiveTab('dashboard');
  };

  const handleClearMockDataToZero = () => {
    setTables([]);
    setMenuItems([]);
    setOrders([]);
    setReservations([]);
    setActiveTab('dashboard');
  };

  // 11. PAY UPGRADE MODULE
  const handleUpgradeProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry) {
      alert(language === 'uz' ? 'Tafsilotlarni to\'ldiring' : 'Fill details');
      return;
    }
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      setPaySuccessCheck(true);
      setIsPremium(true);
      setTimeout(() => {
        setPaySuccessCheck(false);
        setShowUpgradeModal(false);
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
      }, 1800);
    }, 1500);
  };

  // Global Search logic
  const queryLower = globalQuery.toLowerCase();
  const searchResultsOrders = orders.filter(o => o.tableName.toLowerCase().includes(queryLower) || o.waiterName.toLowerCase().includes(queryLower));
  const searchResultsReservations = reservations.filter(r => r.customerName.toLowerCase().includes(queryLower) || r.customerPhone.includes(queryLower));

  if (isCustomerMode) {
    return (
      <CustomerPortalView
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        tables={tables}
        menuItems={menuItems}
        orders={orders}
        reservations={reservations}
        onAddOrder={handleAddOrder}
        onAddReservation={handleAddReservation}
        onExitMode={() => setIsCustomerMode(false)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121214] text-zinc-100 font-sans antialiased selection:bg-amber-405 selection:text-black relative">
      
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-xs z-[190]"
          />
        )}
      </AnimatePresence>

      {/* 1. Collating Sidebar Navigation on Left */}
      <div className={`
        fixed inset-y-0 left-0 z-[200] md:relative md:z-auto md:translate-x-0
        transition-transform duration-300 ease-in-out flex shrink-0 h-full
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          language={language}
          setLanguage={setLanguage}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          tables={tables}
          onAddTable={handleAddTable}
          isPremium={isPremium}
          onOpenUpgradeModal={() => setShowUpgradeModal(true)}
          onOpenSearch={() => setShowSearchModal(true)}
          activeOrdersCount={orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled').length}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          onToggleCustomerMode={() => setIsCustomerMode(true)}
        />
      </div>

      {/* 2. Content Pane on Right */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0e0e11] overflow-hidden">
        
        {/* Navigation context and User Header top bar */}
        <Header
          language={language}
          activeTab={activeTab}
          userName={userName}
          companyName={companyName}
          onOpenSearch={() => setShowSearchModal(true)}
          isPremium={isPremium}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onToggleCustomerMode={() => setIsCustomerMode(true)}
        />

        {/* Dynamic transition layout viewport */}
        <main className="flex-1 overflow-hidden px-8 py-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  language={language}
                  currency={currency}
                  tables={tables}
                  onChangeTableStatus={handleChangeTableStatus}
                  onUpdateTable={handleUpdateTable}
                  onDeleteTable={handleDeleteTable}
                  onAddTable={handleAddTable}
                  orders={orders}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onDeleteOrder={handleDeleteOrder}
                  menuItems={menuItems}
                />
              )}

              {activeTab === 'orders' && (
                <ContractsView
                  language={language}
                  currency={currency}
                  orders={orders}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onDeleteOrder={handleDeleteOrder}
                  tables={tables}
                  menuItems={menuItems}
                  viewingOrderId={viewingOrderId}
                  setViewingOrderId={setViewingOrderId}
                  showCreateForm={showCreateForm}
                  setShowCreateForm={setShowCreateForm}
                  isPremium={isPremium}
                  onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                />
              )}

              {activeTab === 'menu' && (
                <TemplatesView
                  language={language}
                  currency={currency}
                  menuItems={menuItems}
                  onAddMenuItem={handleAddMenuItem}
                  onUpdateMenuItem={handleUpdateMenuItem}
                  onDeleteMenuItem={handleDeleteMenuItem}
                />
              )}

              {activeTab === 'reservations' && (
                <ClientsView
                  language={language}
                  currency={currency}
                  reservations={reservations}
                  onAddReservation={handleAddReservation}
                  onUpdateReservation={handleUpdateReservation}
                  onDeleteReservation={handleDeleteReservation}
                  tables={tables}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  language={language}
                  currency={currency}
                  orders={orders}
                  reservations={reservations}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  language={language}
                  currency={currency}
                  setCurrency={setCurrency}
                  userName={userName}
                  setUserName={setUserName}
                  companyName={companyName}
                  setCompanyName={setCompanyName}
                  onClearMockData={handleClearMockData}
                  onClearMockDataToZero={handleClearMockDataToZero}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* ==================== GLOBAL FAST SEARCH MODAL (Shortkey: '/') ==================== */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-start justify-center z-[240] pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl bg-[#151518] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl relative text-left"
            >
              <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
                <div className="relative flex-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder={language === 'uz' ? 'Qidirish (Stollar, ofitsiantlar, bronlar)...' : 'Filter tables, waiters, bookings...'}
                    value={globalQuery}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                    className="w-full h-10 pl-9 bg-transparent border-none text-sm text-white focus:outline-none placeholder-zinc-500 font-sans"
                  />
                  <Search className="w-4 h-4 text-zinc-505 absolute left-2 top-3" />
                </div>
                <button 
                  onClick={() => setShowSearchModal(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Instant matched records output */}
              <div className="p-4 max-h-80 overflow-y-auto space-y-4">
                {globalQuery.trim() ? (
                  <div className="space-y-4 text-xs">
                    
                    {/* Orders output */}
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 px-1">{language === 'uz' ? 'Faol Buyurtmalar' : 'Kitchen Active bills'}</div>
                      <div className="space-y-1">
                        {searchResultsOrders.map(o => (
                          <button
                            key={o.id}
                            onClick={() => {
                              setViewingOrderId(o.id);
                              setActiveTab('orders');
                              setShowSearchModal(false);
                            }}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-xs flex justify-between items-center cursor-pointer transition text-zinc-300"
                          >
                            <span>{o.tableName} ({o.waiterName})</span>
                            <span className="text-[10px] font-mono text-amber-500">#{o.id}</span>
                          </button>
                        ))}
                        {searchResultsOrders.length === 0 && (
                          <div className="text-[10px] text-zinc-650 px-2 italic">No matched orders found</div>
                        )}
                      </div>
                    </div>

                    {/* Reservations output */}
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 px-1">Bron xonalar / Reservations</div>
                      <div className="space-y-1 text-zinc-300">
                        {searchResultsReservations.map(r => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setActiveTab('reservations');
                              setShowSearchModal(false);
                            }}
                            className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-xs flex justify-between items-center cursor-pointer transition"
                          >
                            <span>{r.customerName} ({r.tableName})</span>
                            <span className="text-[10px] font-mono text-zinc-500">{r.customerPhone}</span>
                          </button>
                        ))}
                        {searchResultsReservations.length === 0 && (
                          <div className="text-[10px] text-zinc-650 px-2 italic">No matched reservation seats found</div>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-sans">
                    {language === 'uz' ? 'Qidirishni boshlash uchun biron-bir kalit so\'z kiriting...' : 'Type search metrics...'}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== PREMIUM UPGRADE MODAL ==================== */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[240] px-4 font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#151518] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  <Sparkles className="w-4 h-4 fill-amber-500/10" />
                  <span className="font-display font-semibold text-[10px] tracking-wider uppercase">{t.membershipInfo}</span>
                </div>
                
                <h3 className="text-base font-display font-bold text-white tracking-tight mb-1">
                  Unlock Lunor Premium Gastro
                </h3>
                
                <p className="text-[10px] text-zinc-400 leading-relaxed mb-4">
                  {t.membershipLimitText}
                </p>

                <ul className="space-y-1.5 mb-5 text-[11px] text-zinc-350 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Unlimited Dining desks and logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Live Kitchen board monitor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Kassa statistics ledger export</span>
                  </li>
                </ul>

                <form onSubmit={handleUpgradeProcess} className="space-y-3.5 border-t border-zinc-850 pt-4 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono uppercase text-zinc-550">Billing Price:</span>
                    <strong className="text-white text-xs">{t.priceText}</strong>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder={t.premiumCardNumber}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 rounded p-2 text-white outline-none focus:border-amber-400 font-mono"
                  />

                  <div className="grid grid-cols-2 gap-3 font-mono text-center">
                    <input
                      type="text"
                      required
                      placeholder={t.premiumCardExpiry}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="bg-[#121214] border border-zinc-800 rounded p-2 text-white outline-none focus:border-amber-400 text-center"
                    />
                    <input
                      type="password"
                      required
                      placeholder="CVC"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="bg-[#121214] border border-zinc-800 rounded p-2 text-white outline-none focus:border-amber-400 text-center"
                    />
                  </div>

                  {isProcessingPay ? (
                    <div className="w-full py-2.5 bg-amber-405/50 text-black font-bold rounded-lg text-center font-mono">
                      Charging Node...
                    </div>
                  ) : paySuccessCheck ? (
                    <div className="w-full py-2.5 bg-emerald-500 text-black font-bold rounded-lg text-center flex items-center justify-center gap-1 uppercase tracking-widest text-[9px]">
                      <CheckCircle className="w-4 h-4" />
                      <span>{t.demandsConfirmed}</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-350 text-black font-extrabold uppercase rounded-lg transition tracking-widest text-[10px]"
                    >
                      {t.premiumPayButton}
                    </button>
                  )}
                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
