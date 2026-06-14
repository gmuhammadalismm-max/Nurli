import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Sparkles,
  ArrowUpRight,
  Download,
  Calendar,
  X,
  FilePenLine,
  Printer,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { Order, Table, MenuItem, Language, OrderItem } from '../types';
import { TRANSLATIONS } from '../data';

type OrderStatus = 'pending' | 'ready' | 'served' | 'paid' | 'cancelled';

interface ContractsViewProps {
  language: Language;
  currency: 'USD' | 'UZS';
  orders: Order[];
  onAddOrder: (order: Omit<Order, 'id' | 'date' | 'time' | 'totalAmount'>) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder: (id: string) => void;
  tables: Table[];
  menuItems: MenuItem[];
  viewingOrderId: string | null;
  setViewingOrderId: (id: string | null) => void;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  isPremium: boolean;
  onOpenUpgradeModal: () => void;
}

export default function ContractsView({
  language,
  currency,
  orders,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  tables,
  menuItems,
  viewingOrderId,
  setViewingOrderId,
  showCreateForm,
  setShowCreateForm,
  isPremium,
  onOpenUpgradeModal,
}: ContractsViewProps) {
  const t = TRANSLATIONS[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // New Order Form states
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedTableId, setSelectedTableId] = useState(tables[0]?.id || '');
  const [waiterName, setWaiterName] = useState('Sardor');
  const [customNotes, setCustomNotes] = useState('');
  const [formItems, setFormItems] = useState<{ menuItemId: string; quantity: number }[]>([
    { menuItemId: menuItems[0]?.id || '', quantity: 1 }
  ]);

  const handleOpenEditOrderModel = (ord: Order) => {
    setEditingOrder(ord);
    setSelectedTableId(ord.tableId);
    setWaiterName(ord.waiterName);
    setCustomNotes(ord.notes || '');
    const mapped = ord.items.map(it => ({
      menuItemId: it.menuItemId,
      quantity: it.quantity
    }));
    setFormItems(mapped.length ? mapped : [{ menuItemId: menuItems[0]?.id || '', quantity: 1 }]);
    setShowCreateForm(true);
  };

  // Billing Signature pad state
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [isSignedEffect, setIsSignedEffect] = useState(false);

  const currencyRate = 12500;
  const formatMoney = (v: number) => {
    if (currency === 'UZS') {
      return v.toLocaleString(language === 'uz' ? 'uz-UZ' : 'en-US') + " UZS";
    }
    const inUSD = Math.round(v / currencyRate);
    return '$' + inUSD.toLocaleString('en-US');
  };

  // Canvas context drawer
  const getCanvas = (): HTMLCanvasElement | null => canvasRef.current;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#fbbf24'; // beautiful amber paint stroke
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Add Item to creation block
  const handleAddRowOfDish = () => {
    setFormItems([...formItems, { menuItemId: menuItems[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveRowOfDish = (idx: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateRowOfDish = (idx: number, updates: Partial<{ menuItemId: string; quantity: number }>) => {
    setFormItems(
      formItems.map((item, i) => i === idx ? { ...item, ...updates } : item)
    );
  };

  const calculateFormTotal = () => {
    return formItems.reduce((acc, cr) => {
      const dish = menuItems.find(m => m.id === cr.menuItemId);
      return acc + (dish ? dish.price * cr.quantity : 0);
    }, 0);
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const billingItems: OrderItem[] = [];

    formItems.forEach((row) => {
      const dish = menuItems.find(m => m.id === row.menuItemId);
      if (dish) {
        billingItems.push({
          menuItemId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: row.quantity
        });
      }
    });

    if (billingItems.length === 0) {
      alert(language === 'uz' ? 'Iltimos, kamida bitta taom qo\'shing.' : 'Please add at least one dish.');
      return;
    }

    const assignedTable = tables.find(t => t.id === selectedTableId);
    const orderData = {
      tableId: selectedTableId,
      tableName: assignedTable?.name || 'X-stol',
      waiterName: waiterName || 'Sardor',
      items: billingItems,
      notes: customNotes
    };

    if (editingOrder) {
      onUpdateOrder(editingOrder.id, {
        ...orderData,
        totalAmount: billingItems.reduce((acc, it) => acc + (it.price * it.quantity), 0)
      });
      setEditingOrder(null);
    } else {
      onAddOrder({
        ...orderData,
        status: 'pending'
      });
    }

    // Reset components states
    setFormItems([{ menuItemId: menuItems[0]?.id || '', quantity: 1 }]);
    setCustomNotes('');
    setShowCreateForm(false);
  };

  // Sign off billing invoice
  const handleExecuteBillSigning = () => {
    if (!viewingOrderId) return;
    
    const signName = signatureMode === 'draw' ? 'Kassa Imzosi' : typedSignature;
    onUpdateOrder(viewingOrderId, {
      status: 'paid',
      paymentMethod: 'cash',
      notes: `Invoice settlement confirmed by signature: "${signName}"`
    });

    setIsSignedEffect(true);
    setTimeout(() => {
      setIsSignedEffect(false);
      setViewingOrderId(null);
    }, 1500);
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    // 1. Search text matching
    const searchString = `${ord.id} ${ord.tableName} ${ord.waiterName} ${ord.notes || ''}`.toLowerCase();
    if (searchTerm && !searchString.includes(searchTerm.toLowerCase())) {
      return false;
    }
    // 2. Status matching filter
    if (statusFilter !== 'all' && ord.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const sortedAndFilteredOrders = [...filteredOrders].sort((a, b) => {
    return sortOrder === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
  });

  const selectedOrder = orders.find(o => o.id === viewingOrderId);

  const orderStatusClass = {
    pending: 'bg-amber-500/15 text-amber-500 border border-amber-500/20',
    ready: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
    served: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    paid: 'bg-zinc-850 text-emerald-500 border border-emerald-500/40',
    cancelled: 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
  };

  return (
    <div className="space-y-6 font-sans select-none overflow-y-auto max-h-full pb-14 pr-1 text-left">
      
      {/* 1. Header Toolbar filters */}
      <div className="bg-[#151518] border border-[#1e1e24] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Quick search input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'uz' ? 'Stol, ofitsiant yoki ID bo\'yicha izlash...' : 'Search by table or waiter...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-[#0c0c0e] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-white outline-none focus:border-amber-400 placeholder-zinc-550"
            />
          </div>

          {/* Status selector filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0c0c0e] border border-zinc-800 text-zinc-300 rounded-lg p-2 text-xs outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">{language === 'uz' ? 'Barcha buyurtmalar' : 'All Orders'}</option>
              <option value="pending">{t.pending}</option>
              <option value="ready">{language === 'uz' ? 'Oshxonada tayyor' : 'Ready'}</option>
              <option value="served">{language === 'uz' ? 'Tortildi' : 'Served'}</option>
              <option value="paid">{language === 'uz' ? 'To\'langan' : 'Paid'}</option>
              <option value="cancelled">{language === 'uz' ? 'Bekor qilingan' : 'Cancelled'}</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingOrder(null);
            setSelectedTableId(tables[0]?.id || '');
            setWaiterName('Sardor');
            setCustomNotes('');
            setFormItems([{ menuItemId: menuItems[0]?.id || '', quantity: 1 }]);
            setShowCreateForm(true);
          }}
          className="h-9 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer font-display tracking-widest block"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'uz' ? 'Yangi buyurtma ochish' : 'Create Order'}</span>
        </button>

      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: Orders list registry */}
        <div className="flex-1 space-y-3">
          
          <div className="space-y-2">
            {sortedAndFilteredOrders.map((ord) => {
              const isSelected = ord.id === viewingOrderId;
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setViewingOrderId(isSelected ? null : ord.id);
                    setTypedSignature('');
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
                    isSelected 
                      ? 'bg-[#1e1b15]/40 border-amber-500/55 shadow-xl shadow-amber-500/5' 
                      : 'bg-[#151518]/60 border-zinc-900 hover:bg-[#151518]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-white text-xs">{ord.tableName}</strong>
                      <span className="text-[10px] text-zinc-500 font-mono font-medium">#{ord.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${orderStatusClass[ord.status] || ''}`}>
                        {t[ord.status] || ord.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 font-mono line-clamp-1 max-w-sm sm:max-w-md">
                      {ord.items.map(it => `${it.name} x${it.quantity}`).join(', ')}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-550 mt-1">
                      <span>Waiter: <strong>{ord.waiterName}</strong></span>
                      {ord.notes && <span className="text-zinc-600 truncate ml-2">💬 {ord.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-zinc-900/60 pt-2.5 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[8px] text-zinc-500 block font-mono">Invoice Value:</span>
                      <strong className="text-amber-400 font-bold font-mono text-sm block">
                        {formatMoney(ord.totalAmount)}
                      </strong>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(language === 'uz' ? 'Haqiqatdan ham shartnoma/buyurtmani o\'chirmoqchimisiz?' : 'Are you sure you want to delete this order?')) {
                          onDeleteOrder(ord.id);
                        }
                      }}
                      className="p-1 px-2.5 bg-zinc-900 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 rounded transition cursor-pointer self-center"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {sortedAndFilteredOrders.length === 0 && (
              <div className="text-center py-16 text-zinc-650 bg-[#151518]/20 border border-dashed border-zinc-850 rounded-xl italic">
                {language === 'uz' ? 'Mos keladigan buyurtmalar topilmadi.' : 'No matched orders found in archives.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Preview/Signing Receipt card */}
        <AnimatePresence>
          {viewingOrderId && selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-96 bg-[#151518] border border-[#1e1e24] rounded-xl overflow-hidden shrink-0 flex flex-col justify-between"
              id="bill-receipt-viewer-panel"
            >
              <div>
                {/* Physical Receipt Top mock */}
                <div className="bg-[#121214] border-b border-zinc-850 p-4 font-mono text-[9px] uppercase tracking-wider text-zinc-500 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-2">
                    <span>Bill Receipt Invoice</span>
                    {selectedOrder.status !== 'paid' && selectedOrder.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditOrderModel(selectedOrder)}
                        className="px-2 py-0.5 rounded bg-amber-400 text-black hover:bg-amber-300 transition text-[9px] font-sans font-bold uppercase cursor-pointer"
                        title="Tahrirlash / Edit Order"
                      >
                        ✏️ {language === 'uz' ? 'Tahrirlash' : 'Edit'}
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setViewingOrderId(null)}
                    className="text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Thermal Invoice Details layout */}
                <div className="p-5 font-mono text-xs">
                  <div className="text-center border-b border-dashed border-zinc-800 pb-4 mb-4">
                    <h3 className="text-sm font-sans font-extrabold text-white tracking-widest leading-none">LUNOR GASTRO</h3>
                    <span className="text-[9px] text-zinc-500 block mt-1.5">Toshkent, Uzbekistan · Tel: +998 (71) 123-4567</span>
                    <span className="text-[8px] text-zinc-600 block mt-0.5">Reference: #{selectedOrder.id}</span>
                  </div>

                  <div className="space-y-1 pb-3 text-[11px] text-zinc-400">
                    <div className="flex justify-between">
                      <span>Dining zone:</span>
                      <span className="text-white font-sans font-bold">{selectedOrder.tableName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Waiter:</span>
                      <span className="text-white font-sans">{selectedOrder.waiterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-amber-400 font-bold uppercase">{selectedOrder.status}</span>
                    </div>
                  </div>

                  {/* Receipt lists */}
                  <div className="border-t border-b border-dashed border-zinc-800 py-3.5 my-3.5 space-y-1.5 text-[11px]">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-300">
                        <span>{it.name} x{it.quantity}</span>
                        <span>{formatMoney(it.price * it.quantity)}</span>
                      </div>
                    ))}
                    
                    <div className="flex justify-between text-zinc-600 text-[10px] pt-1">
                      <span>Included VAT tax (12%):</span>
                      <span>{formatMoney(Math.round(selectedOrder.totalAmount * 0.12))}</span>
                    </div>
                  </div>

                  {/* Net overall sum */}
                  <div className="flex justify-between text-white text-xs font-bold font-mono">
                    <span>NET TOTAL PAYMENT:</span>
                    <span className="text-emerald-400 text-sm font-sans font-bold">{formatMoney(selectedOrder.totalAmount)}</span>
                  </div>

                  {selectedOrder.status !== 'paid' && selectedOrder.status !== 'cancelled' ? (
                    <div className="mt-6 pt-5 border-t border-zinc-900 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Checkout authorization signature:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSignatureMode('draw')}
                            className={`text-[9px] px-1 rounded ${signatureMode === 'draw' ? 'bg-amber-400 text-black' : 'text-zinc-500'}`}
                          >
                            Draw
                          </button>
                          <button
                            onClick={() => setSignatureMode('type')}
                            className={`text-[9px] px-1 rounded ${signatureMode === 'type' ? 'bg-amber-400 text-black' : 'text-zinc-500'}`}
                          >
                            Type
                          </button>
                        </div>
                      </div>

                      {signatureMode === 'draw' ? (
                        <div className="space-y-2">
                          <div className="relative h-28 bg-[#0c0c0e] border border-zinc-850 rounded-lg cursor-crosshair overflow-hidden">
                            <canvas
                              ref={canvasRef}
                              width={340}
                              height={112}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="absolute inset-0 w-full h-full"
                            />
                            <button
                              onClick={clearCanvas}
                              className="absolute bottom-2 right-2 text-[9px] px-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="F.I.SH. yoki Imzo nomi"
                          value={typedSignature}
                          onChange={(e) => setTypedSignature(e.target.value)}
                          className="w-full bg-[#0c0c0e] border border-zinc-800 rounded p-2 text-white font-sans text-xs outline-none focus:border-amber-400"
                        />
                      )}

                      <button
                        onClick={handleExecuteBillSigning}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase rounded-lg mt-3 text-[10px] tracking-wider transition cursor-pointer flex items-center justify-center gap-1 font-display"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>{t.confirmSigning}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 pt-5 border-t border-zinc-900 text-center">
                      <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>KASSA BO'YICHA TO'LANDI / Settle Paid</span>
                      </div>
                      
                      {selectedOrder.paymentMethod && (
                        <span className="text-[10px] text-zinc-500 mt-2 block font-mono">
                          Payment Method: <strong className="text-zinc-300 font-bold uppercase">{selectedOrder.paymentMethod}</strong>
                        </span>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Signing completion micro-alert */}
              {isSignedEffect && (
                <div className="bg-emerald-500 text-black p-3 text-center text-xs font-bold font-sans uppercase animate-pulse">
                  Chek muvaffaqiyatli imzolandi! hisob kassa jurnali arxivlandi.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* YANGI BUYURTMA KO'RINISHIDA DRAWER / FORM */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[240] px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#151518] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl relative"
            >
              
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2 text-amber-500">
                  <Printer className="w-4.5 h-4.5" />
                  <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                    {editingOrder 
                      ? (language === 'uz' ? 'Buyurtmani Tahrirlash' : 'Edit Dining Bill') 
                      : (language === 'uz' ? 'Yangi Buyurtma Kassa' : 'Open Dining Bill')}
                  </h4>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrderSubmit} className="p-5 space-y-4 text-xs">
                
                {/* Tables / Waiters */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">Stol tanlash / Desk:</label>
                    <select
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400"
                    >
                      {tables.map(table => (
                        <option key={table.id} value={table.id}>
                          {table.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">Service Waiter:</label>
                    <input
                      type="text"
                      required
                      value={waiterName}
                      onChange={(e) => setWaiterName(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Sub-Items dynamic editor block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-mono text-[9px] uppercase">TAOMLAR RO'YXATI / DISH LIST:</span>
                    <button
                      type="button"
                      onClick={handleAddRowOfDish}
                      className="text-amber-400 hover:text-amber-300 font-bold text-[9px] flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Add Dish row
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {formItems.map((item, idx) => {
                      return (
                        <div key={idx} className="flex gap-2 items-center bg-[#121214] p-1.5 rounded border border-zinc-850">
                          <select
                            value={item.menuItemId}
                            onChange={(e) => handleUpdateRowOfDish(idx, { menuItemId: e.target.value })}
                            className="bg-transparent text-white outline-none flex-1 font-sans cursor-pointer"
                          >
                            {menuItems.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({formatMoney(d.price)})
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleUpdateRowOfDish(idx, { quantity: parseFloat(e.target.value) || 1 })}
                            className="w-12 bg-zinc-900 text-center rounded border border-zinc-800 p-1 text-white font-sans text-xs"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveRowOfDish(idx)}
                            className="p-1 hover:text-rose-500 text-zinc-600 disabled:opacity-30 cursor-pointer"
                            disabled={formItems.length === 1}
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">Special requests / notes:</label>
                  <input
                    type="text"
                    placeholder="Masalan: Achchiq somsa, salatani piyozsiz qiling"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                {/* Subtotal preview block */}
                <div className="p-3 rounded bg-amber-500/5 border border-amber-500/10 flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Invoice Draft value:</span>
                  <strong className="text-amber-400 font-sans text-sm font-bold">{formatMoney(calculateFormTotal())}</strong>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase rounded-lg cursor-pointer font-sans"
                  >
                    {editingOrder 
                      ? (language === 'uz' ? 'O\'zgarishlarni Saqlash' : 'Save Changes') 
                      : (language === 'uz' ? 'Oshxonaga yuborish' : 'Dispatch Bill')}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
