import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Clock, 
  Menu, 
  ChefHat,
  Sparkles,
  UtensilsCrossed,
  Award,
  Utensils
} from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  activeTab: string;
  userName: string;
  companyName: string;
  onOpenSearch: () => void;
  isPremium: boolean;
  onToggleMobileMenu: () => void;
  onToggleCustomerMode: () => void;
}

export default function Header({
  language,
  activeTab,
  userName,
  companyName,
  onOpenSearch,
  isPremium,
  onToggleMobileMenu,
  onToggleCustomerMode,
}: HeaderProps) {
  const t = TRANSLATIONS[language];
  const [currentTime, setCurrentTime] = useState<string>('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Real-time ticking indicators
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(language === 'uz' ? 'uz-UZ' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  // Map breadcrumbs
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return t.dashboard;
      case 'orders': return t.orders;
      case 'menu': return t.menu;
      case 'reservations': return t.reservations;
      case 'analytics': return t.analytics;
      case 'settings': return t.settings;
      default: return t.dashboard;
    }
  };

  const notifications = [
    {
      id: 'n-1',
      text: language === 'uz' ? 'Oshxonadan xabar: 1-stolda Choyxona Palovi tayyor bo\'ldi!' : 'Kitchen alert: Choyxona Palov is ready for Table 1!',
      time: 'Just now',
      type: 'ready'
    },
    {
      id: 'n-2',
      text: language === 'uz' ? "Yangi bron: Anvar Rahimov soat 19:00 ga 3-stolni band qildi" : "New booking: Anvar Rahimov booked Table 3 for 19:00",
      time: '12 mins ago',
      type: 'info'
    },
    isPremium ? null : {
      id: 'n-3',
      text: language === 'uz' ? "Kassa hisobotlarini yuklab olish uchun premiumga o'ting" : "Upgrade to PRO to download full financial invoices",
      time: '1 hour ago',
      type: 'warn'
    },
  ].filter(Boolean);

  return (
    <header className="h-[52px] border-b border-[#1e1e24] bg-[#0c0c0e] px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 font-sans">
      
      {/* Breadcrumb / Mobile toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850 transition cursor-pointer"
          title="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="hidden sm:inline text-[9px] font-mono tracking-wider text-zinc-500 uppercase">lunor gastro</span>
        <span className="hidden sm:inline text-zinc-650 text-xs">/</span>
        <span className="font-display font-semibold text-xs text-amber-400 tracking-tight flex items-center gap-1">
          <UtensilsCrossed className="w-3 h-3 text-amber-500/80 sm:hidden" />
          {getBreadcrumb()}
        </span>
      </div>

      {/* Middle Welcome back notice */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-zinc-400">
          {t.welcomeBack}, <strong className="text-zinc-200 font-bold">{userName}</strong> <span className="text-zinc-550 font-mono text-[11px]">@{companyName}</span>
        </span>
        {isPremium && (
          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-500/20 text-[9px] font-semibold tracking-wider font-mono">
            <Award className="w-2.5 h-2.5" /> PRO
          </span>
        )}
      </div>

      {/* Right control utilities */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Monospace live clock feed */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121214] border border-[#1e1e24] text-zinc-400 text-[10px]">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-mono tracking-widest">{currentTime}</span>
        </div>

        {/* Global Search prompt button */}
        <button 
          onClick={onOpenSearch}
          className="text-zinc-400 hover:text-white p-2 rounded-md hover:bg-[#151518] transition duration-150 cursor-pointer"
          title={t.search}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button 
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative text-zinc-400 hover:text-white p-2 rounded-md hover:bg-[#151518] transition duration-150 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-10 w-72 md:w-80 bg-[#151518] border border-[#222226] rounded-xl shadow-2xl z-50 p-3 select-none">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
                <span className="text-xs font-semibold text-white">Live Alerts</span>
                <span className="text-[9px] text-zinc-500 font-mono">Kitchen/Host Desk</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n: any) => (
                  <div key={n.id} className="p-2 rounded-lg bg-[#0e0e10] border border-zinc-850 flex gap-2 text-left">
                    <ChefHat className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-zinc-300 leading-normal font-sans">{n.text}</p>
                      <span className="text-[8px] text-zinc-600 font-mono mt-0.5 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Portal Toggle Simulator */}
        <button
          onClick={onToggleCustomerMode}
          className="flex items-center gap-1.5 bg-[#1b1713] hover:bg-[#282119] border border-amber-500/20 text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition scale-95 hover:scale-100 cursor-pointer"
          title={language === 'uz' ? 'Mijoz Buyurtma Portali (QR)' : 'Customer Ordering Portal (QR)'}
        >
          <Utensils className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline">{language === 'uz' ? 'Mijoz rejimi (QR)' : 'QR Menu Simulator'}</span>
        </button>

        {/* User initials bubble logo */}
        <div id="virtual-avatar-dot" className="flex items-center gap-2 border-l border-[#1a1a20] pl-3">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center text-xs font-bold font-display select-none">
            {userName ? userName.slice(0,2).toUpperCase() : 'JG'}
          </div>
        </div>

      </div>

    </header>
  );
}
