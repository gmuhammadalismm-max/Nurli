import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Calendar,
  X,
  Plus,
  CheckCircle,
  HelpCircle,
  UserCheck,
  CalendarDays,
  Sparkles,
  Award,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { Reservation, Table, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface ClientsViewProps {
  language: Language;
  currency: 'USD' | 'UZS';
  reservations: Reservation[];
  onAddReservation: (res: Omit<Reservation, 'id'>) => void;
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => void;
  onDeleteReservation: (id: string) => void;
  tables: Table[];
}

export default function ClientsView({
  language,
  currency,
  reservations,
  onAddReservation,
  onUpdateReservation,
  onDeleteReservation,
  tables,
}: ClientsViewProps) {
  const t = TRANSLATIONS[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  
  // Reservation Form input states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableId, setTableId] = useState(tables[0]?.id || '');
  const [date, setDate] = useState('2026-06-14');
  const [time, setTime] = useState('18:00');
  const [guestsCount, setGuestsCount] = useState<number | string>(2);
  const [notes, setNotes] = useState('');

  const handleOpenEditModal = (res: Reservation) => {
    setEditingReservation(res);
    setCustomerName(res.customerName);
    setCustomerPhone(res.customerPhone);
    setTableId(res.tableId);
    setDate(res.date);
    setTime(res.time);
    setGuestsCount(res.guestsCount);
    setNotes(res.notes);
    setShowAddModal(true);
  };

  const handleCreateReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !tableId) {
      alert(language === 'uz' ? 'Iltimos, mehmon ismi va telefon raqamini to\'ldiring.' : 'Please enter main details.');
      return;
    }

    const assignedTable = tables.find(t => t.id === tableId);
    const reservationData = {
      customerName,
      customerPhone,
      tableId,
      tableName: assignedTable?.name || 'X-stol',
      date,
      time,
      guestsCount,
      notes,
    };

    if (editingReservation) {
      onUpdateReservation(editingReservation.id, reservationData);
      setEditingReservation(null);
    } else {
      onAddReservation({
        ...reservationData,
        status: 'confirmed'
      });
    }

    // Reset Inputs
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setShowAddModal(false);
  };

  // KPI calculations
  const totalBookings = reservations.length;
  const activeBookings = reservations.filter(r => r.status === 'confirmed').length;
  const attendedCount = reservations.filter(r => r.status === 'attended').length;
  const totalGuestSeats = reservations.reduce((s, r) => s + (r.status === 'confirmed' ? (Number(r.guestsCount) || 0) : 0), 0);

  const statusColors = {
    confirmed: 'bg-amber-400/10 text-amber-450 border border-amber-500/20',
    attended: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
  };

  return (
    <div className="space-y-6 font-sans select-none overflow-y-auto max-h-full pb-14 pr-1">
      
      {/* Reservations KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI: Jami bronlar */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-4 flex items-center justify-between h-20">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{language === 'uz' ? 'Jami Bronlar Ro\'yxati' : 'Total Bookings Booked'}</span>
            <h4 className="text-xl font-display font-bold text-white mt-1">{totalBookings}</h4>
          </div>
          <div className="p-2 rounded bg-[#1e1e24] text-zinc-400">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>

        {/* KPI: Faol tasdiqlanganlar */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-4 flex items-center justify-between h-20">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{t.confirmed}</span>
            <h4 className="text-xl font-display font-bold text-amber-400 mt-1">{activeBookings}</h4>
          </div>
          <div className="p-2 rounded bg-amber-500/10 text-amber-400">
            <Plus className="w-4 h-4" />
          </div>
        </div>

        {/* KPI: Kelganlar uchrashuvi */}
        <div className="bg-[#151518] border border-[#1e1e24] rounded-xl p-4 flex items-center justify-between h-20">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{language === 'uz' ? 'Joylashtirilgan mehmonlar' : 'Guests Seated'}</span>
            <h4 className="text-xl font-display font-bold text-emerald-400 mt-1">{attendedCount}</h4>
          </div>
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Controller block */}
      <div className="flex items-center justify-between bg-[#151518] border border-[#1e1e24] p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500" />
          <div>
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">
              {t.reservations}
            </h3>
            <span className="hidden sm:inline text-[9px] text-zinc-500 font-mono block">Active calendar guest book tracker</span>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingReservation(null);
            setCustomerName('');
            setCustomerPhone('');
            setNotes('');
            setGuestsCount(2);
            setDate('2026-06-14');
            setTime('18:00');
            setTableId(tables[0]?.id || '');
            setShowAddModal(true);
          }}
          className="h-8 px-3.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] uppercase flex items-center gap-1 transition cursor-pointer font-display tracking-wider"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{t.newReservation}</span>
        </button>
      </div>

      {/* Booked Guest Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map((res) => {
          return (
            <div 
              key={res.id}
              className="bg-[#151518] border border-[#1e1e24] p-4 rounded-xl hover:border-zinc-800 transition flex flex-col justify-between h-52 group text-xs text-left"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-display font-bold text-amber-400">
                      {res.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{res.customerName}</h4>
                      <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono mt-1">
                        <CalendarDays className="w-3 h-3 text-zinc-600" />
                        <span>{res.date} @ {res.time}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${statusColors[res.status] || ''}`}>
                    {res.status === 'confirmed' ? t.confirmed : res.status === 'attended' ? t.attended : t.cancelled}
                  </span>
                </div>

                {/* Notes/Phone details */}
                <div className="space-y-1.5 text-[11px] text-zinc-400 border-t border-zinc-900 pt-2.5">
                  <div className="flex items-center gap-2 text-zinc-300 font-semibold font-mono">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{res.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-550 font-mono text-[9px] uppercase">Assigned table:</span>
                    <span className="text-amber-400 font-bold">{res.tableName}</span>
                  </div>
                  <p className="text-zinc-500 text-[10px] line-clamp-1 italic">
                    {res.notes ? `"${res.notes}"` : 'No custom notes provided'}
                  </p>
                </div>
              </div>

              {/* Status advancement actions */}
              <div className="flex items-center justify-between border-t border-zinc-900 pt-2.5 mt-2.5">
                <span className="text-[9px] font-mono text-zinc-550">
                  Capacity: <strong className="text-zinc-350">{res.guestsCount} Pax</strong>
                </span>

                <div className="flex items-center gap-1">
                  {res.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => onUpdateReservation(res.id, { status: 'attended' })}
                        className="px-2 py-1 bg-emerald-500 hover:bg-emerald-450 text-black font-bold text-[9px] rounded-lg transition uppercase tracking-wider cursor-pointer font-sans"
                        title="Mark as Arrived"
                      >
                        {t.attended}
                      </button>
                      <button
                        onClick={() => onUpdateReservation(res.id, { status: 'cancelled' })}
                        className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 font-bold text-[9px] rounded-lg transition uppercase cursor-pointer font-sans"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleOpenEditModal(res)}
                    className="p-1.5 px-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 text-zinc-400 hover:text-amber-400 font-bold text-[9px] rounded-lg transition uppercase cursor-pointer"
                    title={language === 'uz' ? 'Tahrirlash' : 'Edit'}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(language === 'uz' ? 'Bron buyurtmasini ro\'yxatdan butkul o\'chirmoqchimisiz?' : 'Delete this reservation entry?')) {
                        onDeleteReservation(res.id);
                      }
                    }}
                    className="p-1.5 px-2 bg-zinc-900 border border-zinc-800 border-transparent hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                    title={t.delete}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {reservations.length === 0 && (
          <div className="col-span-full py-14 text-center italic text-zinc-600 bg-[#151518]/10 border border-dashed border-zinc-850 rounded-xl">
            {language === 'uz' ? 'Bron qilingan mehmonlar ro\'yxati bo\'sh.' : 'Customer booking ledger is currently empty.'}
          </div>
        )}
      </div>

      {/* ADD RESERVATION BOOKINGS POPDOWN MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-[240] px-4 font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#151518] border border-zinc-850 rounded-xl overflow-hidden shadow-2xl relative text-left"
            >
              
              <div className="p-4 border-b border-[#222226] flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2 text-amber-400">
                  <UserPlus className="w-4.5 h-4.5 text-amber-500" />
                  <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                    {editingReservation 
                      ? (language === 'uz' ? 'Bronni Tahrirlash' : 'Edit Reservation Booking') 
                      : t.newReservation}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateReservationSubmit} className="p-5 space-y-4 text-xs">
                
                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.guestName}:</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Malik Rasulov"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.guestPhone} (Tel):</label>
                  <input
                    type="text"
                    required
                    placeholder="+998 90 123 45 67"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">{language === 'uz' ? 'Stol tanlash' : 'Dining Table'}:</label>
                    <select
                      value={tableId}
                      onChange={(e) => setTableId(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 cursor-pointer font-sans"
                    >
                      {tables.map(table => (
                        <option key={table.id} value={table.id}>
                          {table.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.guestCount}:</label>
                    <input
                      type="text"
                      required
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.date}:</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.reservationTime}:</label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.reservationNotes}:</label>
                  <input
                    type="text"
                    placeholder="E.g. Tug'ilgan kun nishonlanishi..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer bg-zinc-900 border border-zinc-800"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold cursor-pointer"
                  >
                    {editingReservation 
                      ? (language === 'uz' ? 'O\'zgarishlarni Saqlash' : 'Update Reservation') 
                      : (language === 'uz' ? 'Bron Yaratish' : 'Settle Reservation')}
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
