import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Building2, 
  Check, 
  Moon, 
  Volume2, 
  Trash2,
  Lock,
  Globe,
  Coins,
  Store,
  ChevronRight,
  Info
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface SettingsViewProps {
  language: Language;
  currency: 'USD' | 'UZS';
  setCurrency: (curr: 'USD' | 'UZS') => void;
  userName: string;
  setUserName: (name: string) => void;
  companyName: string;
  setCompanyName: (company: string) => void;
  onClearMockData: () => void;
  onClearMockDataToZero: () => void;
}

export default function SettingsView({
  language,
  currency,
  setCurrency,
  userName,
  setUserName,
  companyName,
  setCompanyName,
  onClearMockData,
  onClearMockDataToZero,
}: SettingsViewProps) {
  const t = TRANSLATIONS[language];
  const [success, setSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showZeroConfirm, setShowZeroConfirm] = useState(false);
  const [inputs, setInputs] = useState({
    name: userName,
    company: companyName,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(inputs.name.trim() || 'John Doe');
    setCompanyName(inputs.company.trim() || 'Lunor Gastro');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowResetConfirm(true);
  };

  const handleHardResetToZero = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowZeroConfirm(true);
  };

  return (
    <div className="space-y-6 font-sans select-none overflow-y-auto max-h-full pb-14 pr-1 text-left">
      
      <div className="flex items-center gap-2 bg-[#151518] border border-[#1e1e24] p-4 rounded-xl">
        <Settings className="w-5 h-5 text-amber-500" />
        <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
          {t.workspaceSettings}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile/Cafe naming Inputs */}
        <div className="bg-[#151518] border border-[#1e1e24] p-5 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-2">
            <Store className="w-4 h-4 text-zinc-400" />
            <h4 className="text-white font-display text-xs font-semibold tracking-tight uppercase">{language === 'uz' ? 'Muassasa sozlamalari' : 'Cafe & Bistro Meta profiles'}</h4>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            
            {/* Manager name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">{language === 'uz' ? 'Tizim Boshqaruvchisi' : t.fullName}</label>
              <input
                type="text"
                required
                value={inputs.name}
                onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                className="w-full bg-[#121214] border border-[#222226] rounded p-2.5 text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Cafe branding name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">{language === 'uz' ? 'Restoran / Kafe nomi' : t.companyName}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={inputs.company}
                  onChange={(e) => setInputs({ ...inputs, company: e.target.value })}
                  className="w-full bg-[#121214] border border-[#222226] rounded p-2.5 pl-8 text-white outline-none focus:border-amber-400"
                />
                <Store className="w-3.5 h-3.5 text-zinc-650 absolute left-2.5 top-3.5" />
              </div>
            </div>

            {/* Currency switcher settings */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase">{t.currencyUnit}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition flex items-center justify-center gap-1.5 ${currency === 'USD' ? 'bg-[#1e1e24] text-amber-500 border-amber-500/50' : 'bg-transparent text-zinc-500 border-zinc-900'}`}
                >
                  <Coins className="w-4 h-4" />
                  <span>USD ($)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrency('UZS')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition flex items-center justify-center gap-1.5 ${currency === 'UZS' ? 'bg-[#1e1e24] text-amber-500 border-amber-500/50' : 'bg-transparent text-zinc-500 border-zinc-900'}`}
                >
                  <Coins className="w-4 h-4" />
                  <span>UZS (so'm)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-900 mt-6">
              
              {success ? (
                <div className="text-zinc-450 font-bold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.settingsSaved}</span>
                </div>
              ) : <div />}

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs cursor-pointer uppercase font-display tracking-wider"
              >
                <span>{t.saveSettings}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Diagnostic/Reset Sidebar Panel */}
        <div className="space-y-4">
          
          <div className="bg-[#151518] border border-[#1e1e24] p-5 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-2 text-zinc-400">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <h4 className="text-white font-display text-xs font-bold tracking-tight uppercase">{language === 'uz' ? 'Tizimni tozalash' : 'Clear Ledger logs'}</h4>
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal font-sans">
              {language === 'uz' ? 'Ushbu tugmalar platforma ma\'lumotlarini yangilash va boshlang\'ich holatga tushirish imkoniyatini beradi.' : 'Buttons below let you restore standard demonstration seed metrics or empty everything down to absolute 0.'}
            </p>

            <button
              onClick={handleReset}
              className="w-full py-2 rounded-lg border border-zinc-800 text-zinc-400 bg-zinc-900/40 hover:bg-zinc-800 text-[10px] uppercase font-bold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'uz' ? 'Namunaviy holatga qaytarish' : 'Reset to baseline data'}</span>
            </button>

            <button
              onClick={handleHardResetToZero}
              className="w-full py-2 rounded-lg border border-rose-500/10 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 text-[10px] uppercase font-bold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'uz' ? '0 GA TUSHIRISH (To\'liq 0)' : 'RESET TO ABSOLUTE ZERO'}</span>
            </button>
          </div>

          <div className="bg-[#151518] border border-[#1e1e24] p-5 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-2 text-zinc-400">
              <Info className="w-4 h-4" />
              <h4 className="text-white font-display text-xs font-bold tracking-tight uppercase">System Engines</h4>
            </div>

            <div className="text-[10px] text-zinc-400 leading-normal space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Database engine:</span> 
                <span className="text-amber-500 font-sans font-semibold">Local Reactive</span>
              </div>
              <div className="flex justify-between">
                <span>Tax calculations:</span> 
                <span className="text-white font-sans font-semibold">12% VAT standard</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Custom Reset to baseline Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151518] border border-zinc-800 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="text-white font-display font-bold text-xs uppercase tracking-widest text-amber-500">
              {language === 'uz' ? 'Tasdiqlash' : 'Confirm Reset'}
            </h4>
            <p className="text-xs text-zinc-350 leading-relaxed">
              {language === 'uz' 
                ? 'Haqiqatdan ham barcha faol buyurtmalarni o\'chirib, dastlabki namunaviy holatga qaytarmoqchimisiz?' 
                : 'Are you sure you want to clear restaurant records back to baseline seed data?'}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded text-[10px] uppercase font-bold cursor-pointer"
              >
                {language === 'uz' ? 'Bekor qilish' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearMockData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded text-[10px] uppercase font-bold cursor-pointer font-sans"
              >
                {language === 'uz' ? 'Tasdiqlash' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reset to 0 Confirmation Modal */}
      {showZeroConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-rose-500/20 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="text-rose-450 font-display font-bold text-xs uppercase tracking-widest">
              {language === 'uz' ? 'DIQQAT SEZILAMLI AMAL' : 'CRITICAL WARNING!'}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {language === 'uz' 
                ? 'Barcha stollar, muloqotlar, taomlar, faol buyurtmalar va bandlarni butkul o\'chirib, platformani 0 ga tushurmoqchimisiz? Ushbu amaldan keyin barchasi tozalanadi, ortga qaytarib bo\'lmaydi!' 
                : 'Are you sure you want to wipe all tables, food menus, orders, and reservations completely to 0? This action is irreversible!'}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowZeroConfirm(false)}
                className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded text-[10px] uppercase font-bold cursor-pointer"
              >
                {language === 'uz' ? 'Orqaga' : 'No, Keep'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearMockDataToZero();
                  setShowZeroConfirm(false);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] uppercase font-bold cursor-pointer font-sans"
              >
                {language === 'uz' ? "0 GA TUSHIRISH" : 'YES, WIPE EVERYTHING'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
