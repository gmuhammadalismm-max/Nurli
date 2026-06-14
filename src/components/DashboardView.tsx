import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  Plus, 
  Users, 
  Coffee, 
  ShoppingBag, 
  Activity, 
  ChevronRight, 
  DollarSign, 
  ChevronDown,
  Printer,
  ChevronUp,
  AlertCircle,
  FileCheck2,
  Trash2,
  Utensils,
  X
} from 'lucide-react';
import { Table, MenuItem, Order, OrderItem, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface DashboardViewProps {
  language: Language;
  currency: 'USD' | 'UZS';
  tables: Table[];
  onChangeTableStatus: (tableId: string, status: 'free' | 'occupied' | 'reserved') => void;
  onUpdateTable: (tableId: string, updates: Partial<Table>) => void;
  onDeleteTable: (tableId: string) => void;
  onAddTable: (name: string, seatsCount: number) => void;
  orders: Order[];
  onAddOrder: (order: Omit<Order, 'id' | 'date' | 'time' | 'totalAmount'>) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (orderId: string) => void;
  menuItems: MenuItem[];
}

export default function DashboardView({
  language,
  currency,
  tables,
  onChangeTableStatus,
  onUpdateTable,
  onDeleteTable,
  onAddTable,
  orders,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  menuItems,
}: DashboardViewProps) {
  const t = TRANSLATIONS[language];
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  // Table active state triggers
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showAddDishModal, setShowAddDishModal] = useState<boolean>(false);
  const [activeWaitersName, setActiveWaitersName] = useState('Sardor');

  // Table addition form state
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState<number | string>(4);

  // Inline Table Edit States
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [tableNameInput, setTableNameInput] = useState('');
  const [tableSeatsInput, setTableSeatsInput] = useState<number | string>(4);

  // Dish selecting temporary states
  const [chosenDishId, setChosenDishId] = useState(menuItems[0]?.id || '');
  const [chosenDishQty, setChosenDishQty] = useState(1);
  const [orderDishNotes, setOrderDishNotes] = useState('');

  // Settle bill popdown modal state
  const [settlingOrderId, setSettlingOrderId] = useState<string | null>(null);
  const [customerReview, setCustomerReview] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'click' | 'payme'>('cash');

  // Currency utility helper
  const currencyRate = 12500;
  const formatMoney = (v: number) => {
    if (currency === 'UZS') {
      return v.toLocaleString(language === 'uz' ? 'uz-UZ' : 'en-US') + " UZS";
    }
    // Simple conversion to USD
    const inUSD = Math.round(v / currencyRate);
    return '$' + inUSD.toLocaleString('en-US');
  };

  // Compute live cafeteria statistics
  const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
  const finishedOrders = orders.filter(o => o.status === 'paid');
  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const reservedTables = tables.filter(t => t.status === 'reserved');

  const dailyTurnoverSum = finishedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const currentActiveTurnover = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Total cash ledger check sizes
  const totalCompletedBillsCount = finishedOrders.length;
  const averageBillAmount = totalCompletedBillsCount > 0 ? Math.round(dailyTurnoverSum / totalCompletedBillsCount) : 38000;

  // Recent order list
  const recentOrdersSorted = [...orders]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  // Status mapping colors
  const orderStatusClass = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    ready: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    served: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    paid: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  // Add item handle
  const handleAddItemToSelectedTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId) return;

    const dish = menuItems.find(d => d.id === chosenDishId);
    if (!dish) return;

    // Check if an existing order is active for this Table
    const activeOrderForTable = orders.find(o => o.tableId === selectedTableId && o.status !== 'paid' && o.status !== 'cancelled');

    if (activeOrderForTable) {
      // Append item to active order
      const existingItemIdx = activeOrderForTable.items.findIndex(i => i.menuItemId === chosenDishId);
      let updatedItems: OrderItem[] = [...activeOrderForTable.items];

      if (existingItemIdx > -1) {
        updatedItems[existingItemIdx].quantity += chosenDishQty;
      } else {
        updatedItems.push({
          menuItemId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: chosenDishQty
        });
      }

      const newTotal = updatedItems.reduce((acc, chunk) => acc + (chunk.price * chunk.quantity), 0);
      onUpdateOrder(activeOrderForTable.id, {
        items: updatedItems,
        totalAmount: newTotal,
        notes: orderDishNotes ? `${activeOrderForTable.notes || ''}; ${orderDishNotes}` : activeOrderForTable.notes
      });
    } else {
      // Create a brand new active order
      onAddOrder({
        tableId: selectedTableId,
        tableName: tables.find(t => t.id === selectedTableId)?.name || 'X-stol',
        status: 'pending',
        waiterName: activeWaitersName,
        items: [{
          menuItemId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: chosenDishQty
        }],
        notes: orderDishNotes
      });
    }

    // Force set table as occupied
    onChangeTableStatus(selectedTableId, 'occupied');

    // Reset temporary states
    setChosenDishQty(1);
    setOrderDishNotes('');
    setShowAddDishModal(false);
  };

  // Complete checkout billing
  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingOrderId) return;

    const ord = orders.find(o => o.id === settlingOrderId);
    if (!ord) return;

    // Upgrade order to Paid
    onUpdateOrder(settlingOrderId, {
      status: 'paid',
      paymentMethod: paymentType,
      notes: customerReview ? `${ord.notes || ''} [Review: ${customerReview}]` : ord.notes
    });

    // Mark associated table as Free
    onChangeTableStatus(ord.tableId, 'free');

    // Reset variables
    setSettlingOrderId(null);
    setCustomerReview('');
  };

  // Quick helper to fetch active order for any table
  const getTableActiveOrder = (tableId: string) => {
    return orders.find(o => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled');
  };

  // Hardcoded graph values for cafe peak times
  const hourlyLabels = ['11:00', '13:00', '15:00', '17:00', '19:00', '21:00'];
  const hourlyValues = [12, 38, 21, 15, 68, 45]; // percentage density

  return (
    <div className="space-y-6 select-none font-sans overflow-y-auto max-h-full pb-14 pr-1">
      
      {/* 1. KPIs Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Jami buyurtmalar */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-450">{t.totalOrders}</span>
            <ShoppingBag className="w-4 h-4 text-amber-500/80" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-white tracking-tight leading-none mt-2">
              {orders.length}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">+{finishedOrders.length} {t.paid.toLowerCase()}</span> · {activeOrders.length} {t.pending.toLowerCase()}
            </p>
          </div>
        </div>

        {/* KPI: Kunlik tushum */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-450">{t.dailyRevenue}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-emerald-400 tracking-tight leading-none mt-2 truncate">
              {formatMoney(dailyTurnoverSum)}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">
              Active bills pipeline: <strong className="text-zinc-300 font-semibold">{formatMoney(currentActiveTurnover)}</strong>
            </p>
          </div>
        </div>

        {/* KPI: Band stollar */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-450">{t.activeTables}</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-white tracking-tight leading-none mt-2">
              {occupiedTables.length} / {tables.length}
            </h3>
            <p className="text-[10px] text-amber-400/90 mt-1 font-semibold">
              {reservedTables.length} {t.reserved.toLowerCase()}
            </p>
          </div>
        </div>

        {/* KPI: O'rtacha chek */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-450">{t.averageBill}</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight leading-none mt-2">
                {formatMoney(averageBillAmount)}
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">
                Based on active catalogs
              </p>
            </div>
            
            {/* Visual Mini graph element */}
            <div className="flex items-end gap-1 h-8 shrink-0 max-w-[40px]">
              <div className="w-1.5 h-3 bg-zinc-800 rounded-xs" />
              <div className="w-1.5 h-5 bg-zinc-800 rounded-xs" />
              <div className="w-1.5 h-8 bg-amber-400/80 rounded-xs animate-pulse" />
            </div>
          </div>
        </div>

      </div>

      {/* 2. Visual Stollar Map and Interactive Table Grid */}
      <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-5" id="dining-tables-dashboard-grid">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-sm text-white tracking-tight">
                {language === 'uz' ? 'Muassasa Stollar Xaritasi' : 'Virtual Dining Table Spaces'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setNewTableName('');
                  setNewTableSeats(4);
                  setShowAddTableModal(true);
                }}
                className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-black font-display font-bold text-[9px] rounded uppercase transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{language === 'uz' ? "Stol qo'shish" : 'Add Table'}</span>
              </button>
            </div>
            <p className="text-[10px] text-zinc-550 mt-0.5">
              {language === 'uz' ? 'Stollarning bandlik holatini va faol buyurtmalarni boshqaring' : 'Click any table to quickly change occupancy or add dishes'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-[9px] font-mono text-zinc-400">
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t.free}</div>
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {language === 'uz' ? 'Band' : 'Occupied'}</div>
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {t.reserved}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {tables.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-850 rounded-xl bg-zinc-900/10 flex flex-col items-center justify-center space-y-3">
              <span className="text-zinc-500 text-xs italic">
                {language === 'uz' ? "Hali stollar mavjud emas. Yangi stol qo'shib boshlang!" : 'No tables registered on the grid yet.'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewTableName('');
                  setNewTableSeats(4);
                  setShowAddTableModal(true);
                }}
                className="px-4 py-1.5 bg-[#1b1b1f] border border-zinc-800 text-amber-500 font-bold hover:text-amber-400 text-[10px] rounded-lg uppercase transition cursor-pointer"
              >
                + {language === 'uz' ? "Birinchi stolni qo'shish" : 'Add First Table'}
              </button>
            </div>
          )}
          {tables.map((table) => {
            const activeOrder = getTableActiveOrder(table.id);
            const isSelected = selectedTableId === table.id;

            let cardBg = 'bg-[#111113] border-zinc-900 hover:border-zinc-800';
            let statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';

            if (table.status === 'occupied') {
              cardBg = 'bg-[#1b1214] border-rose-500/10 hover:border-rose-500/25 text-rose-100';
              statusBadgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            } else if (table.status === 'reserved') {
              cardBg = 'bg-[#191511] border-amber-500/10 hover:border-amber-500/25 text-amber-100';
              statusBadgeColor = 'bg-amber-400/10 text-amber-450 border border-amber-500/20';
            }

            if (isSelected) {
              cardBg += ' ring-1 ring-amber-400 border-transparent';
            }

            return (
              <div 
                key={table.id}
                id={`table-card-${table.id}`}
                onClick={() => setSelectedTableId(isSelected ? null : table.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between min-h-[120px] ${cardBg}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="font-display font-bold text-xs tracking-tight line-clamp-1 block select-none">
                      {table.name}
                    </span>
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider block">
                      {table.seatsCount} Pax
                    </span>
                  </div>

                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full mt-1.5 inline-block font-bold ${statusBadgeColor}`}>
                    {table.status === 'free' ? t.free : table.status === 'occupied' ? t.occupied : t.reserved}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-900/40 mt-3">
                  {activeOrder ? (
                    <div>
                      <span className="text-[8px] text-zinc-500 font-mono block">Active Bill:</span>
                      <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                        {formatMoney(activeOrder.totalAmount)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-zinc-650 italic">Empty desk</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Table Interactive HUD Panel */}
        <AnimatePresence>
          {selectedTableId && (() => {
            const currentTable = tables.find(t => t.id === selectedTableId);
            if (!currentTable) return null;
            const activeOrder = getTableActiveOrder(selectedTableId);

            return (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl bg-[#0e0e11] border border-zinc-800 space-y-4 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Coffee className="w-5 h-5" />
                    </div>
                    {isEditingTable ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <input
                          type="text"
                          value={tableNameInput}
                          onChange={(e) => setTableNameInput(e.target.value)}
                          className="bg-[#121214] border border-zinc-800 p-1.5 px-2.5 rounded font-sans text-xs text-white max-w-[120px] outline-none focus:border-amber-400"
                          placeholder="Stol nomi"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">Pax:</span>
                          <input
                            type="text"
                            value={tableSeatsInput}
                            onChange={(e) => setTableSeatsInput(e.target.value)}
                            className="bg-[#121214] border border-zinc-800 p-1.5 rounded font-sans text-xs text-white w-12 text-center outline-none focus:border-amber-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (tableNameInput.trim()) {
                              onUpdateTable(currentTable.id, { name: tableNameInput.trim(), seatsCount: tableSeatsInput });
                              setIsEditingTable(false);
                            }
                          }}
                          className="px-2 py-1.5 bg-emerald-500 text-black font-bold text-[10px] rounded hover:bg-emerald-400 cursor-pointer"
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(language === 'uz' ? 'Stolni butkul o\'chirmoqchimisiz?' : 'Delete this dining desk?')) {
                              onDeleteTable(currentTable.id);
                              setSelectedTableId(null);
                              setIsEditingTable(false);
                            }
                          }}
                          className="px-2 py-1.5 bg-rose-500 text-white font-bold text-[10px] rounded hover:bg-rose-400 cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingTable(false)}
                          className="px-2 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] rounded hover:bg-zinc-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-display font-semibold text-white text-xs">{currentTable.name} ({currentTable.seatsCount} {t.tableCapacity.toLowerCase()})</h5>
                          <button
                            type="button"
                            onClick={() => {
                              setTableNameInput(currentTable.name);
                              setTableSeatsInput(currentTable.seatsCount);
                              setIsEditingTable(true);
                            }}
                            className="text-[10px] hover:text-amber-400 text-zinc-500 underline font-mono cursor-pointer"
                            title="Tahrirlash / Edit Table"
                          >
                            ✏️ {language === 'uz' ? 'tahrirlash' : 'edit'}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          Status of dining register space
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onChangeTableStatus(selectedTableId, 'free')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition border ${
                        currentTable.status === 'free'
                          ? 'bg-emerald-500 text-black border-transparent'
                          : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {t.free}
                    </button>
                    <button
                      onClick={() => onChangeTableStatus(selectedTableId, 'occupied')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition border ${
                        currentTable.status === 'occupied'
                          ? 'bg-rose-500 text-white border-transparent'
                          : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {language === 'uz' ? 'Band etish' : 'Occupied'}
                    </button>
                    <button
                      onClick={() => onChangeTableStatus(selectedTableId, 'reserved')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition border ${
                        currentTable.status === 'reserved'
                          ? 'bg-amber-400 text-black border-transparent'
                          : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {t.reserved}
                    </button>
                  </div>
                </div>

                {/* Bill / Dish actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h6 className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 mb-2">
                      {language === 'uz' ? 'Hisobdagi taomlar' : 'Dishes on Table bill'}
                    </h6>

                    {activeOrder ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
                        {activeOrder.items.map((it, k) => (
                          <div key={k} className="flex justify-between items-center py-1 bg-zinc-900/40 px-2 rounded border border-zinc-850 text-[11px]">
                            <span className="text-zinc-200">
                              {it.name} <strong className="text-amber-500 font-bold ml-1">x{it.quantity}</strong>
                            </span>
                            <span className="font-mono text-zinc-400">{formatMoney(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-zinc-555 italic py-4">
                        {language === 'uz' ? 'Stolda hali faol rasta ochilmagan. Buyurtma berishni boshlang.' : 'No items added. Process some beverages.'}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-mono">
                        <span className="text-zinc-500">Service Waiter:</span>
                        <span className="text-zinc-300 font-semibold">{activeOrder?.waiterName || 'Sardor'}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-3 font-mono">
                        <span className="text-amber-400">Total Sum:</span>
                        <span className="text-amber-400 font-bold font-sans text-sm">
                          {formatMoney(activeOrder?.totalAmount || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setChosenDishId(menuItems[0]?.id || '');
                          setShowAddDishModal(true);
                        }}
                        className="px-3.5 py-1.5 text-[11px] font-bold bg-amber-400 text-black hover:bg-amber-300 rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1 uppercase"
                      >
                        <Plus className="w-3.5 h-3.5 hover:scale-105" />
                        <span>{language === 'uz' ? 'Taom qo\'shish' : 'Add Item'}</span>
                      </button>

                      {activeOrder && (
                        <button
                          onClick={() => {
                            setSettlingOrderId(activeOrder.id);
                            setCustomerReview('');
                          }}
                          className="px-3.5 py-1.5 text-[11px] font-bold bg-[#1e1e24] text-white hover:bg-zinc-800 rounded-lg border border-zinc-700 transition shrink-0 cursor-pointer flex items-center gap-1 uppercase"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{language === 'uz' ? 'Hisobni yopish / Kassa' : 'Settle Bill'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* 3. Live Kitchen Preparing Line & Category metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Kitchen Cooks Board */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-900">
            <Utensils className="w-4 h-4 text-purple-400" />
            <h4 className="font-display font-bold text-xs text-white tracking-tight uppercase">
              {language === 'uz' ? 'Oshxona faol buyurtmalari' : 'Kitchen Prep queue'}
            </h4>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {activeOrders.map((ord) => (
              <div key={ord.id} className="p-3 bg-[#0f0f12] border border-zinc-850 rounded-xl flex items-center justify-between text-xs gap-4 hover:border-zinc-800 transition">
                <div className="space-y-1 max-w-[60%]">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-xs">{ord.tableName}</strong>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${orderStatusClass[ord.status] || ''}`}>
                      {t[ord.status] || ord.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-amber-500 font-mono truncate max-w-full">
                    {ord.items.map(it => `${it.name} x${it.quantity}`).join(', ')}
                  </p>

                  {ord.notes && (
                    <span className="text-[10px] text-zinc-500 block italic leading-tight">
                      💬 {ord.notes}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div className="mr-2">
                    <span className="text-[8px] text-zinc-500 block font-mono">Total bill:</span>
                    <strong className="text-white text-xs block font-mono">{formatMoney(ord.totalAmount)}</strong>
                  </div>

                  {/* Immediate advancing operations */}
                  {ord.status === 'pending' && (
                    <button
                      onClick={() => onUpdateOrder(ord.id, { status: 'ready' })}
                      className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-[10px] rounded transition cursor-pointer"
                    >
                      {language === 'uz' ? 'Tayyor qil' : 'Cooked'}
                    </button>
                  )}
                  {ord.status === 'ready' && (
                    <button
                      onClick={() => onUpdateOrder(ord.id, { status: 'served' })}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] rounded transition cursor-pointer"
                    >
                      {language === 'uz' ? 'Tortildi' : 'Serve'}
                    </button>
                  )}
                  {ord.status === 'served' && (
                    <button
                      onClick={() => {
                        setSettlingOrderId(ord.id);
                        setCustomerReview('');
                      }}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] rounded transition cursor-pointer"
                    >
                      {t.sign}
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteOrder(ord.id)}
                    className="p-1 text-zinc-600 hover:text-rose-500 rounded hover:bg-zinc-800 cursor-pointer"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {activeOrders.length === 0 && (
              <div className="text-center py-10 text-zinc-650 italic">
                {language === 'uz' ? 'Hozircha faol buyurtmalar mavjud emas.' : 'No active items in preparation queue.'}
              </div>
            )}
          </div>
        </div>

        {/* 2. Restaurant categorization breakout graph */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider mb-4 border-b border-zinc-900 pb-2">
              {language === 'uz' ? 'Sotuv tahlili (Kategoriya)' : 'Category Sales Share'}
            </h4>
            
            <div className="space-y-4">
              {[
                { name: t.taomlar, color: 'bg-amber-500', share: 55, total: 2450000 },
                { name: t.ichimliklar, color: 'bg-emerald-500', share: 25, total: 1100000 },
                { name: t.shirinliklar, color: 'bg-purple-500', share: 12, total: 540000 },
                { name: t.fastfood, color: 'bg-blue-500', share: 8, total: 360000 }
              ].map((catSum, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-semibold">{catSum.name}</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{catSum.share}% ({formatMoney(catSum.total)})</span>
                  </div>
                  {/* Visual tracker bar */}
                  <div className="w-full h-1.5 bg-[#121214] rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${catSum.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${catSum.share}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between font-mono">
            <span>Overall Ledger Volume:</span>
            <span className="text-amber-400 font-bold font-sans text-xs">
              {formatMoney(orders.reduce((acc, cr) => acc + cr.totalAmount, 0))}
            </span>
          </div>
        </div>

      </div>

      {/* ==================== DISH ADDITION Inline-Modal ==================== */}
      <AnimatePresence>
        {showAddDishModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[240] px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#151518] border border-zinc-850 p-5 rounded-xl shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddDishModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h4 className="font-display font-semibold text-xs uppercase text-amber-400 tracking-wider mb-4 flex items-center gap-1.5">
                <Coffee className="w-4 h-4" />
                <span>{language === 'uz' ? 'Stolga taom qo\'shish' : 'Add Dish to Table'}</span>
              </h4>

              <form onSubmit={handleAddItemToSelectedTable} className="space-y-4 text-xs">
                {/* Waiter assignment */}
                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">Service Waiter:</label>
                  <input
                    type="text"
                    required
                    value={activeWaitersName}
                    onChange={(e) => setActiveWaitersName(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                {/* Dish Select */}
                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.selectTemplate}:</label>
                  {menuItems.length === 0 ? (
                    <div className="py-3 px-2 text-center bg-[#121214] border border-zinc-800 rounded text-[11px] text-zinc-400">
                      {language === 'uz' 
                        ? "Hali biron taom ro'yxatda mavjud emas. Avval 'Taomlar Menusi' bo'limida yangi taomlar qo'shing." 
                        : "No dishes are registered in the menu catalog yet. Go to the 'Food Menu' tab to add items first."}
                    </div>
                  ) : (
                    <select
                      value={chosenDishId}
                      onChange={(e) => setChosenDishId(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                    >
                      {menuItems.map(dish => (
                        <option key={dish.id} value={dish.id}>
                          {dish.name} - {formatMoney(dish.price)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Qty and notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">Quantity:</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={99}
                      value={chosenDishQty}
                      onChange={(e) => setChosenDishQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 text-center font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">Dish Class:</label>
                    <div className="p-2 bg-[#121214] border border-zinc-800 text-zinc-500 text-center rounded font-semibold text-[10px]">
                      {menuItems.find(x => x.id === chosenDishId)?.category.toUpperCase() || 'TAOM'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.customContract}:</label>
                  <input
                    type="text"
                    placeholder="Masalan: Achchiq somsa, piyozsiz bering"
                    value={orderDishNotes}
                    onChange={(e) => setOrderDishNotes(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg font-sans transition mt-2 cursor-pointer uppercase tracking-widest text-[10px]"
                >
                  {language === 'uz' ? 'Yuborish (Oshxonaga)' : 'Dispatch to Kitchen'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== BILLS BILL SETTLEMENT MODAL ==================== */}
      <AnimatePresence>
        {settlingOrderId && (() => {
          const billingOrder = orders.find(o => o.id === settlingOrderId);
          if (!billingOrder) return null;

          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[240] px-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm bg-[#151518] border border-zinc-850 p-6 rounded-xl shadow-2xl relative text-left"
              >
                <button 
                  onClick={() => setSettlingOrderId(null)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-white">
                    {language === 'uz' ? 'Yakuniy Hisob-Kitob' : 'Settle Register check'}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono block">Order reference: {billingOrder.id}</span>
                </div>

                <form onSubmit={handleExecuteCheckout} className="space-y-4 text-xs">
                  
                  {/* Virtual receipt representation list */}
                  <div className="p-3 bg-[#0c0c0e] rounded-lg border border-zinc-850 space-y-1.5 font-mono text-[10px] max-h-32 overflow-y-auto">
                    <div className="text-zinc-500 border-b border-zinc-900 pb-1 flex justify-between">
                      <span>TAOM NOMI / ITEM</span>
                      <span>SUMMA</span>
                    </div>
                    {billingOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-300">
                        <span>{it.name} x{it.quantity}</span>
                        <span>{formatMoney(it.price * it.quantity)}</span>
                      </div>
                    ))}
                    <div className="text-amber-400 font-bold border-t border-zinc-900 pt-1.5 flex justify-between text-[11px]">
                      <span>{t.contractValue}</span>
                      <span>{formatMoney(billingOrder.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Payment Type Selection */}
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">To'lov shakli / Method:</label>
                    <div className="grid grid-cols-4 gap-1.5 font-sans">
                      {(['cash', 'card', 'click', 'payme'] as const).map((pay) => (
                        <button
                          key={pay}
                          type="button"
                          onClick={() => setPaymentType(pay)}
                          className={`py-1.5 text-[10px] font-bold rounded cursor-pointer transition uppercase text-center border ${
                            paymentType === pay
                              ? 'bg-amber-400 border-transparent text-black'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {pay}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.typeYourSignature}:</label>
                    <input
                      type="text"
                      placeholder={t.signaturePlaceholder}
                      value={customerReview}
                      onChange={(e) => setCustomerReview(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-black font-bold uppercase rounded-lg transition mt-2 font-display text-[10px] tracking-wider"
                  >
                    {t.confirmSigning}
                  </button>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Table Addition Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151518] border border-zinc-800 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-left">
            <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider text-amber-400">
              {language === 'uz' ? "Yangi stol qo'shish" : 'Add New Table Space'}
            </h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTableName.trim()) {
                  onAddTable(newTableName.trim(), newTableSeats);
                  setShowAddTableModal(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-550 uppercase">
                  {language === 'uz' ? 'Stol nomi / raqami' : 'Table Name / Code'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 12-Stol, VIP-A"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-[#121214] border border-[#222226] text-white text-xs p-2.5 rounded outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-550 uppercase">
                  {language === 'uz' ? "O'rinlar soni (Pax)" : 'Seats Count (Pax)'}
                </label>
                <input
                  type="text"
                  required
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(e.target.value)}
                  className="w-full bg-[#121214] border border-[#222226] text-white text-xs p-2.5 rounded outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded font-bold uppercase text-[9px] cursor-pointer"
                >
                  {language === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded font-bold uppercase text-[9px] cursor-pointer"
                >
                  {language === 'uz' ? 'Yaratish' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
