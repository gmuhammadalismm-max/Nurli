import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  CheckCircle, 
  Award, 
  Clock, 
  Percent,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Users,
  UtensilsCrossed,
  ChefHat
} from 'lucide-react';
import { Order, Reservation, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface AnalyticsViewProps {
  language: Language;
  currency: 'USD' | 'UZS';
  orders: Order[];
  reservations: Reservation[];
}

export default function AnalyticsView({
  language,
  currency,
  orders,
  reservations,
}: AnalyticsViewProps) {
  const t = TRANSLATIONS[language];
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const currencyRate = 12500;
  const formatMoney = (v: number) => {
    if (currency === 'UZS') {
      return v.toLocaleString(language === 'uz' ? 'uz-UZ' : 'en-US') + " UZS";
    }
    const inUSD = Math.round(v / currencyRate);
    return '$' + inUSD.toLocaleString('en-US');
  };

  // Derive stats
  const totalOrdersCount = orders.length;
  const paidOrders = orders.filter(o => o.status === 'paid');
  const preparingOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const servedOrders = orders.filter(o => o.status === 'served');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activePipelineRevenue = (preparingOrders.length + readyOrders.length + servedOrders.length) > 0 
    ? orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0)
    : 0;
  const cancelledLossValuation = cancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // High fidelity Waiter performance scoreboard
  const waiterScores: { [name: string]: { totalOrders: number; totalAmount: number } } = {};
  orders.forEach((ord) => {
    if (ord.status === 'paid') {
      const name = ord.waiterName || 'Sardor';
      if (!waiterScores[name]) {
        waiterScores[name] = { totalOrders: 0, totalAmount: 0 };
      }
      waiterScores[name].totalOrders += 1;
      waiterScores[name].totalAmount += ord.totalAmount;
    }
  });

  const sortedWaiters = Object.entries(waiterScores)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // Export report simulator
  const triggerExportSimulation = () => {
    setIsExporting(true);
    setExportDone(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans select-none overflow-y-auto max-h-full pb-14 pr-1 text-left">
      
      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151518] border border-[#1e1e24] p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
              {t.analytics} Dashboard
            </h3>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
              Live intelligence feed of menu orders, valuations, and service performance
            </p>
          </div>
        </div>

        <button
          onClick={triggerExportSimulation}
          disabled={isExporting}
          className="h-9 px-4 rounded-lg bg-[#1e1e24] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-[#2d2d34] text-xs font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-50 uppercase tracking-wider font-display text-[10px]"
        >
          {isExporting ? (
            <>
              <span className="animate-spin text-zinc-550">⏳</span>
              <span>{t.generating}</span>
            </>
          ) : exportDone ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Exported Excel</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportReport}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Metric Card 1: Revenue Breakdowns */}
        <div className="bg-[#151518] border border-[#1e1e24] p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">MOLIYAVIY KO'RSATKICHLAR</span>
            <h4 className="text-white font-display text-sm font-semibold tracking-tight uppercase mt-1">{language === 'uz' ? 'Tushum va Hisobdorlik' : 'Ledger Valuations'}</h4>
            <p className="text-[10px] text-zinc-500">Volume distribution of eatery accounts</p>
          </div>

          <div className="space-y-3">
            {/* Net Paid Sales */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-zinc-500">{t.paid} (Kassa)</span>
                <div className="text-sm font-bold text-[#10b981] mt-0.5">{formatMoney(totalPaidRevenue)}</div>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>

            {/* Pipeline Orders (active table bills) */}
            <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-zinc-500">{language === 'uz' ? 'Faol hisob-kitoblar' : 'Active Bills'}</span>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{formatMoney(activePipelineRevenue)}</div>
              </div>
              <Clock className="w-5 h-5 text-amber-450" />
            </div>

            {/* Lost valuation (Cancelled food) */}
            {cancelledLossValuation > 0 && (
              <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono text-zinc-500">Bekor qilingan taomlar</span>
                  <div className="text-xs font-bold text-rose-450 mt-0.5">{formatMoney(cancelledLossValuation)}</div>
                </div>
                <TrendingDown className="w-5 h-5 text-rose-500" />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono flex justify-between pr-1">
            <span>Overall eatery transactions:</span>
            <span className="text-zinc-200 font-sans">{formatMoney(totalPaidRevenue + activePipelineRevenue)}</span>
          </div>
        </div>

        {/* Metric Card 2: Interactive order status distribution */}
        <div className="bg-[#151518] border border-[#1e1e24] p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">FAOL STATUSLAR ULUCHI</span>
            <h4 className="text-zinc-350 font-display text-sm font-semibold tracking-tight uppercase mt-1">{t.statusChart}</h4>
            <p className="text-[10px] text-zinc-500">Breakdown ratios of active meal preps</p>
          </div>

          {/* SVG ring status representation */}
          <div className="h-28 flex items-center justify-center relative">
            <svg viewBox="0 0 120 120" className="w-[110px] h-[110px] -rotate-90">
              {/* Back Circle */}
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1d1d24" strokeWidth="8" />
              
              {/* Paid segment Arc */}
              <circle 
                cx="60" cy="60" r="50" fill="transparent" 
                stroke="#10b981" strokeWidth="10" 
                strokeDasharray="314"
                strokeDashoffset={314 - (314 * (totalOrdersCount > 0 ? (paidOrders.length / totalOrdersCount) : 0.6))} 
                strokeLinecap="round" 
              />

              {/* Preparing orders (Pending) Arc */}
              {preparingOrders.length > 0 && (
                <circle 
                  cx="60" cy="60" r="50" fill="transparent" 
                  stroke="#fbbf24" strokeWidth="10" 
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * (preparingOrders.length / totalOrdersCount))} 
                  strokeLinecap="round" 
                  className="origin-center rotate-[90deg]"
                />
              )}
            </svg>

            {/* Total orders in center */}
            <div className="absolute flex flex-col items-center">
              <span className="text-base font-bold text-white font-display leading-none">{totalOrdersCount}</span>
              <span className="text-[9px] text-zinc-500 uppercase font-mono mt-0.5">Orders</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center text-[9px] font-mono">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="text-zinc-400">Paid ({paidOrders.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
              <span className="text-zinc-400">Preps ({preparingOrders.length + readyOrders.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-400">Served ({servedOrders.length})</span>
            </div>
          </div>
        </div>

        {/* Metric Card 3: Waiters Leaderboard */}
        <div className="bg-[#151518] border border-[#1e1e24] p-5 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider">KPI REYTINGI</span>
            <h4 className="text-zinc-350 font-display text-sm font-semibold tracking-tight uppercase mt-1">{language === 'uz' ? 'Ofitsiantlar hisoboti' : 'Service Leaderboard'}</h4>
            <p className="text-[10px] text-zinc-500">Waiters ranked by paid guest receipts</p>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center max-h-[140px] overflow-y-auto">
            {sortedWaiters.length > 0 ? (
              sortedWaiters.map((waiter, idx) => (
                <div key={waiter.name} className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] font-bold text-zinc-650">#{idx + 1}</span>
                    <span className="text-xs text-white font-semibold truncate">{waiter.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-amber-400 font-mono font-medium block">{formatMoney(waiter.totalAmount)}</span>
                    <span className="text-[8px] text-zinc-500 block font-mono">{waiter.totalOrders} check bills</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-zinc-600 italic text-[11px]">
                {language === 'uz' ? 'To\'langan buyurtmalar kutilyapti...' : 'Awaiting completed transactions...'}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-900 text-[9px] text-zinc-500 font-mono flex items-center justify-between">
            <span>Overall bookings volume:</span>
            <span className="flex items-center gap-0.5 text-amber-500">
              <Users className="w-3.5 h-3.5" /> {reservations.length} Bookings
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
