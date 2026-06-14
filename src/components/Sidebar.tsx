import React, { useState } from 'react';
import { 
  BarChart3, 
  Settings as SettingsIcon, 
  Search, 
  Sparkles, 
  X,
  Languages,
  Check,
  Coffee,
  Utensils,
  ClipboardList,
  CalendarDays,
  Plus,
  Users,
  ChevronDown
} from 'lucide-react';
import { Table, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface SidebarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tables: Table[];
  onAddTable: (name: string, seats: number) => void;
  isPremium: boolean;
  onOpenUpgradeModal: () => void;
  onOpenSearch: () => void;
  activeOrdersCount: number;
  onCloseMobileMenu?: () => void;
  onToggleCustomerMode: () => void;
}

export default function Sidebar({
  language,
  setLanguage,
  activeTab,
  setActiveTab,
  tables,
  onAddTable,
  isPremium,
  onOpenUpgradeModal,
  onOpenSearch,
  activeOrdersCount,
  onCloseMobileMenu,
  onToggleCustomerMode,
}: SidebarProps) {
  const t = TRANSLATIONS[language];
  const [newTableName, setNewTableName] = useState('');
  const [newTableSeats, setNewTableSeats] = useState<number | string>(4);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);

  const handleCreateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableName.trim()) {
      onAddTable(newTableName.trim(), newTableSeats);
      setNewTableName('');
      setNewTableSeats(4);
      setIsCreatingTable(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Utensils },
    { id: 'orders', label: t.orders, icon: ClipboardList },
    { id: 'menu', label: t.menu, icon: Coffee },
    { id: 'reservations', label: t.reservations, icon: CalendarDays },
    { id: 'analytics', label: t.analytics, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  return (
    <div id="sidebar-container" className="w-64 max-h-screen border-r border-[#1e1e24] bg-[#0c0c0e] flex flex-col justify-between shrink-0 select-none font-sans h-full">
      {/* Upper Area */}
      <div className="flex flex-col overflow-y-auto pt-4 px-3 flex-1 pb-4">
        
        {/* Brand/Establishment Title - Lunor Gastro Lounge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <button 
              id="brand-selector-btn"
              onClick={() => setBrandOpen(!brandOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#151518] border border-[#222226] text-white hover:bg-[#1a1a1f] transition duration-150 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-md text-amber-500 border border-amber-500/20">
                  <Coffee className="w-4 h-4 fill-amber-500/5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold tracking-tight text-xs text-amber-400">Lunor Gastro</span>
                  <span className="text-[9px] text-zinc-500 uppercase font-mono">Tashkent Hub</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {brandOpen && (
              <div className="absolute top-12 left-0 right-0 p-1.5 bg-[#151518] border border-[#222226] rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] text-zinc-500 uppercase px-2 py-1 font-mono tracking-wider">
                  {language === 'uz' ? 'Muassasalar' : 'Establishments'}
                </div>
                <div className="w-full text-zinc-200 text-xs px-2 py-1.5 hover:bg-[#25252b] rounded flex items-center justify-between cursor-pointer">
                  <span>Lunor Gastro Lounge</span>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="w-full text-zinc-400 text-xs px-2 py-1.5 hover:bg-[#25252b] rounded flex items-center justify-between cursor-pointer opacity-70">
                  <span>Lunor Express Cafe</span>
                </div>
                <div className="w-full text-zinc-400 text-xs px-2 py-1.5 hover:bg-[#25252b] rounded flex items-center justify-between cursor-pointer opacity-70">
                  <span>Terrace Pool Bar</span>
                </div>
              </div>
            )}
          </div>

          {onCloseMobileMenu && (
            <button
              onClick={onCloseMobileMenu}
              className="md:hidden p-2 text-zinc-450 hover:text-white rounded-lg bg-[#151518] border border-[#222226] hover:bg-[#1e1e24] transition cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global search trigger */}
        <button 
          id="sidebar-search-trigger"
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full h-8 px-2.5 mb-5 rounded-md bg-[#121214] border border-[#1e1e24] text-zinc-400 text-xs hover:border-[#383842] transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span>{t.search}...</span>
          </div>
          <span className="font-mono text-[10px] bg-[#222226] text-zinc-500 px-1 py-0.5 rounded border border-[#2d2d34]">/</span>
        </button>

        {/* Café Navigation Options */}
        <div id="main-nav-items" className="space-y-0.5 mb-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold gap-3 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#151518] text-white border border-[#222226]' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#121214]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'orders' && activeOrdersCount > 0 && (
                  <span className="bg-[#1f1e18] text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-amber-500/25">
                    {activeOrdersCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* QR Menu Portal Simulate trigger */}
          <button
            onClick={() => {
              if (onCloseMobileMenu) onCloseMobileMenu();
              onToggleCustomerMode();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold gap-3 transition-all cursor-pointer bg-[#1b1713]/40 border border-amber-500/10 text-amber-400 hover:bg-[#201a14]/60 hover:text-amber-300"
          >
            <div className="flex items-center gap-2.5">
              <Utensils className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{language === 'uz' ? 'Mijoz rejimi (QR)' : 'QR Menu Portal'}</span>
            </div>
            <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded">
              {language === 'uz' ? 'FAOL' : 'LIVE'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#1a1a20] my-2 mx-1" />

        {/* Stollar (Tables) list section in local sidebar HUD */}
        <div id="stollar-custom-list" className="mt-3 flex-1">
          <div className="flex items-center justify-between px-1 mb-2 text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            <span>{language === 'uz' ? 'Stollar' : 'Tables'}</span>
            <button 
              onClick={() => setIsCreatingTable(!isCreatingTable)}
              className="hover:text-amber-400 transition cursor-pointer p-0.5 rounded bg-[#151518] border border-[#222226]"
              title={t.createTable}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table Creation Form Popdown */}
          {isCreatingTable && (
            <form onSubmit={handleCreateTableSubmit} className="mb-3 px-1 p-2 bg-[#121214] rounded border border-zinc-800 space-y-2">
              <input
                type="text"
                autoFocus
                required
                placeholder={t.createTablePlaceholder}
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="w-full text-xs bg-[#0c0c0e] border border-zinc-850 rounded p-1.5 text-white outline-none focus:border-amber-400 font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span>{t.tableCapacity}:</span>
                <input
                  type="text"
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(e.target.value)}
                  className="w-16 bg-[#0c0c0e] border border-zinc-850 text-white rounded px-2 py-0.5 text-center text-xs font-sans"
                />
              </div>
              <div className="flex gap-1 justify-end pt-1">
                <button 
                  type="button" 
                  onClick={() => setIsCreatingTable(false)}
                  className="px-2 py-0.5 rounded bg-[#1e1e24] text-[10px] text-zinc-400 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="px-2 py-0.5 rounded bg-amber-500 text-[10px] font-bold text-black cursor-pointer hover:bg-amber-400"
                >
                  {t.save}
                </button>
              </div>
            </form>
          )}

          {/* Tables quick shortcuts */}
          <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
            {tables.slice(0, 8).map((table) => {
              const isActive = activeTab === `table-${table.id}`;
              
              // Status colored bulbs
              const bulletColor = table.status === 'free' 
                ? 'bg-emerald-500 animate-pulse' 
                : table.status === 'reserved' 
                ? 'bg-amber-400' 
                : 'bg-red-500';

              return (
                <button
                  key={table.id}
                  onClick={() => {
                    setActiveTab('dashboard');
                    setTimeout(() => {
                      const el = document.getElementById(`table-card-${table.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#151518] text-white border border-[#222226]' 
                      : 'text-zinc-400 hover:text-white hover:bg-[#121214]'
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[140px] truncate">
                    <div className={`w-2 h-2 rounded-full ${bulletColor}`} />
                    <span className="truncate">{table.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {table.seatsCount}
                  </span>
                </button>
              );
            })}
            {tables.length === 0 && (
              <div className="text-[10px] text-zinc-600 px-2 italic py-1">
                {t.noFolders}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Downward Controls: Language & Premium */}
      <div className="p-3 bg-[#0a0a0c] border-t border-[#1a1a20] space-y-3">
        
        {/* Language toggler */}
        <div id="language-toggle-pill" className="flex items-center justify-between bg-[#121214] border border-[#222226] p-1 rounded-lg">
          <div className="flex items-center gap-1.5 pl-2 text-zinc-500">
            <Languages className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono uppercase tracking-wider">Lang</span>
          </div>
          <div className="flex gap-0.5">
            <button
              onClick={() => setLanguage('uz')}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                language === 'uz'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              UZB
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition ${
                language === 'en'
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              ENG
            </button>
          </div>
        </div>

        {/* Premium upgrade card */}
        <div 
          id="premium-upgrade-card"
          className="relative overflow-hidden rounded-xl border border-[#2d2d34] bg-gradient-to-br from-[#18181b] to-[#121214] p-4 text-left shadow-lg select-none"
        >
          {isPremium ? (
            <div>
              <div className="flex items-center gap-1.5 text-amber-500 mb-1.5">
                <Sparkles className="w-4 h-4 fill-amber-500/20" />
                <span className="font-display font-semibold text-xs tracking-tight uppercase">Premium Gastro</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                {t.upgradeSuccess}
              </p>
            </div>
          ) : (
            <div>
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenUpgradeModal(); }}
                className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-white mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <h4 className="font-display font-semibold text-white text-xs leading-snug tracking-tight mb-0.5">
                {t.upgradeTitle}
              </h4>
              <p className="text-[10px] text-zinc-450 leading-snug mb-2 font-sans">
                {language === 'uz' ? 'Cheksiz stollar, buyurtmalar va tahliliy kassa.' : 'Get limitless tables, kitchen prep monitor, and full financial logs.'}
              </p>

              <button
                onClick={onOpenUpgradeModal}
                className="w-full py-1 rounded-lg bg-[#2d2d34] hover:bg-[#34343c] text-white text-[10px] font-medium border border-[#3c3c44] transition cursor-pointer text-center"
              >
                {t.upgradeButton}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
