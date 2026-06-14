import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Coffee, 
  Search,
  BookOpen,
  DollarSign,
  Layers,
  Check,
  Percent
} from 'lucide-react';
import { MenuItem, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface TemplatesViewProps {
  language: Language;
  currency: 'USD' | 'UZS';
  menuItems: MenuItem[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  onDeleteMenuItem: (id: string) => void;
}

export default function TemplatesView({
  language,
  currency,
  menuItems,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}: TemplatesViewProps) {
  const t = TRANSLATIONS[language];
  const [selectedItemId, setSelectedItemId] = useState<string>(menuItems[0]?.id || '');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'taomlar' | 'ichimliklar' | 'shirinliklar' | 'fastfood'>('all');
  const [searchText, setSearchText] = useState('');

  // Add Item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | string>(15000);
  const [category, setCategory] = useState<'taomlar' | 'ichimliklar' | 'shirinliklar' | 'fastfood'>('taomlar');
  const [description, setDescription] = useState('');

  // Full detailed multi-attribute edit mode
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number | string>(15000);
  const [editCategory, setEditCategory] = useState<'taomlar' | 'ichimliklar' | 'shirinliklar' | 'fastfood'>('taomlar');
  const [editDescription, setEditDescription] = useState('');

  const handleStartEditingAll = (item: MenuItem) => {
    setEditName(item.name);
    setEditPrice(item.price);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setIsEditingAll(true);
  };

  const handleSaveEditingAll = (itemId: string) => {
    if (editName.trim()) {
      onUpdateMenuItem(itemId, {
        name: editName.trim(),
        price: Number(editPrice) || 0,
        category: editCategory,
        description: editDescription.trim()
      });
      setIsEditingAll(false);
    }
  };

  // Live price adjustment state
  const [priceEditing, setPriceEditing] = useState(false);
  const [editingPriceVal, setEditingPriceVal] = useState<number | string>(15000);

  const currencyRate = 12500;
  const formatMoney = (v: number) => {
    if (currency === 'UZS') {
      return v.toLocaleString(language === 'uz' ? 'uz-UZ' : 'en-US') + " UZS";
    }
    const inUSD = Math.round(v / currencyRate);
    return '$' + inUSD.toLocaleString('en-US');
  };

  // Compile filter
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedItem = menuItems.find(item => item.id === selectedItemId) || filteredItems[0] || menuItems[0];

  const handleAddNewDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddMenuItem({
        name: name.trim(),
        price: Number(price) || 0,
        category: category,
        description: description.trim(),
        isAvailable: true
      });
      setName('');
      setPrice(15000);
      setDescription('');
      setShowAddForm(false);
    }
  };

  const handleUpdatePrice = () => {
    if (selectedItem) {
      onUpdateMenuItem(selectedItem.id, { price: Number(editingPriceVal) || 0 });
      setPriceEditing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans select-none overflow-y-auto max-h-full pb-14 pr-1">
      
      {/* Search and Category Filters */}
      <div className="bg-[#151518] border border-[#1e1e24] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'uz' ? 'Taom izlash...' : 'Search dish...'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs bg-[#0c0c0e] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-white outline-none focus:border-amber-400"
          />
        </div>

        {/* Categories toggler row */}
        <div className="flex flex-wrap items-center gap-1">
          {([
            { id: 'all', label: language === 'uz' ? 'Barchasi' : 'All' },
            { id: 'taomlar', label: t.taomlar },
            { id: 'ichimliklar', label: t.ichimliklar },
            { id: 'shirinliklar', label: t.shirinliklar },
            { id: 'fastfood', label: t.fastfood }
          ] as const).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition capitalize ${
                activeCategoryFilter === cat.id
                  ? 'bg-amber-400 text-black'
                  : 'bg-[#1e1e24] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: Dishes list */}
        <div className="w-full lg:w-96 space-y-4 shrink-0">
          <div className="bg-[#151518] border border-[#1e1e24] p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                  {t.menu}
                </h3>
                <span className="text-[10px] text-zinc-500 block">{t.menuExplanation}</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1 px-2.5 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-bold rounded-lg transition select-none flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'uz' ? 'Qo\'shish' : 'Add'}</span>
            </button>
          </div>

          {/* Add dish dropdown card */}
          {showAddForm && (
            <form onSubmit={handleAddNewDish} className="bg-[#151518] border border-zinc-800 p-4 rounded-xl space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishName}:</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Tandir Kebab"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishPrice} (UZS):</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishCategory}:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="taomlar">{t.taomlar}</option>
                    <option value="ichimliklar">{t.ichimliklar}</option>
                    <option value="shirinliklar">{t.shirinliklar}</option>
                    <option value="fastfood">{t.fastfood}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishDescription}:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ziravorlar bilan pishirilgan barra go'sht..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 leading-normal"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 rounded-lg cursor-pointer text-[10px]"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-amber-400 hover:bg-amber-350 font-bold text-black rounded-lg cursor-pointer text-[10px]"
                >
                  {t.save}
                </button>
              </div>
            </form>
          )}

          {/* Loop menu items */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isSelected = item.id === selectedItemId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setIsEditingAll(false);
                    setPriceEditing(false);
                    setEditingPriceVal(item.price);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#151518] border-amber-500/40 shadow-lg' 
                      : 'bg-[#151518]/50 border-zinc-920 hover:bg-[#151518]'
                  }`}
                >
                  <div className="space-y-1 truncate flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-zinc-200'}`}>
                        {item.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-zinc-550 truncate leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-zinc-400 block">{formatMoney(item.price)}</span>
                    <span className="text-[8px] text-zinc-650 block uppercase font-mono tracking-wider">{t[item.category] || item.category}</span>
                  </div>
                </button>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-10 text-zinc-600 italic text-xs bg-[#151518]/20 border border-dashed border-zinc-850 rounded-xl">
                {language === 'uz' ? 'Mos keladigan taom turlari topilmadi.' : 'No matched active dishes.'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed dish card */}
        {selectedItem && (
          <div className="flex-1 bg-[#151518] border border-[#1e1e24] rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-[#1e1e24] bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{language === 'uz' ? 'TAOMNING TO\'LIQ TARSIFI' : 'DISH MANIFEST'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditingAll && (
                    <button
                      type="button"
                      onClick={() => handleStartEditingAll(selectedItem)}
                      className="px-2.5 py-1 rounded bg-amber-400 text-black font-display font-bold text-[9px] uppercase hover:bg-amber-300 transition cursor-pointer"
                    >
                      ✏️ {language === 'uz' ? 'Tahrirlash' : 'Edit'}
                    </button>
                  )}
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border ${
                    selectedItem.isAvailable 
                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-500 border-zinc-850'
                  }`}>
                    {selectedItem.isAvailable ? t.available : t.unavailable}
                  </span>
                </div>
              </div>

              {isEditingAll ? (
                <div className="p-6 space-y-4 text-xs text-left">
                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishName}:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishPrice} (UZS):</label>
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 font-sans text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishCategory}:</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="taomlar">{t.taomlar}</option>
                        <option value="ichimliklar">{t.ichimliklar}</option>
                        <option value="shirinliklar">{t.shirinliklar}</option>
                        <option value="fastfood">{t.fastfood}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-500 block font-mono text-[9px] uppercase">{t.dishDescription}:</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-[#121214] border border-zinc-800 p-2 text-white rounded outline-none focus:border-amber-400 leading-normal"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingAll(false)}
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded hover:text-white cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEditingAll(selectedItem.id)}
                      className="px-4 py-1.5 bg-amber-400 text-black font-bold text-[10px] rounded hover:bg-amber-350 cursor-pointer"
                    >
                      {language === 'uz' ? 'Saqlash' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6 text-left">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white tracking-tight">{selectedItem.name}</h3>
                    <span className="text-[10px] font-mono text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded mt-2 inline-block capitalize font-bold">
                      Category: {t[selectedItem.category] || selectedItem.category}
                    </span>
                  </div>

                  {/* Ingredients/Formula */}
                  <div className="space-y-2">
                    <span className="block font-mono text-[9px] uppercase text-zinc-500 tracking-wider">Tarkibi & Retsept</span>
                    <div className="p-4 bg-[#0e0e11] border border-zinc-900 text-zinc-400 text-xs leading-relaxed rounded-lg leading-normal italic">
                      {selectedItem.description}
                    </div>
                  </div>

                  {/* Price & availability control box */}
                  <div className="p-4 rounded-xl bg-[#0e0e11] border border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <span className="text-zinc-550 text-[10px] block font-mono uppercase">Amaldagi narxi:</span>
                      
                      {priceEditing ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="text"
                            value={editingPriceVal}
                            onChange={(e) => setEditingPriceVal(e.target.value)}
                            className="w-24 bg-[#151518] text-white rounded border border-zinc-850 px-2 py-1 text-xs font-sans outline-none focus:border-amber-400"
                          />
                          <button
                            onClick={handleUpdatePrice}
                            className="p-1 px-2.5 bg-emerald-500 text-black text-[10px] rounded font-bold hover:bg-emerald-400 cursor-pointer"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <strong className="text-white text-base font-medium font-sans">{formatMoney(selectedItem.price)}</strong>
                          <button
                            onClick={() => {
                              setPriceEditing(true);
                              setEditingPriceVal(selectedItem.price);
                            }}
                            className="text-[9px] hover:text-amber-400 text-zinc-500 underline font-mono"
                          >
                            (O'zgartirish)
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-xs flex flex-col justify-center">
                      <span className="text-zinc-550 text-[10px] block font-mono uppercase">Oshxona sotuv statusi:</span>
                      
                      <button
                        onClick={() => onUpdateMenuItem(selectedItem.id, { isAvailable: !selectedItem.isAvailable })}
                        className={`w-full py-1 px-3 mt-1 text-[10px] font-bold rounded-lg border text-center cursor-pointer transition uppercase ${
                          selectedItem.isAvailable
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 text-rose-400'
                        }`}
                      >
                        {selectedItem.isAvailable ? 'Sotuvdan olish (Tugadi)' : 'Sotuvga chiqarish'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer deletion utility */}
            <div className="p-4 border-t border-[#1e1e24] bg-[#0c0c0e]/80 flex items-center justify-between">
              <span className="text-[9px] text-zinc-650 font-mono">
                Item SKU: m_{selectedItem.id}
              </span>

              <button
                onClick={() => {
                  if (confirm(language === 'uz' ? 'Haqiqatdan ham ushbu taomni menudan o\'chirmoqchimisiz?' : 'Are you sure you want to delete this menu item?')) {
                    onDeleteMenuItem(selectedItem.id);
                  }
                }}
                className="p-1.5 px-3 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-500 text-[10px] rounded-lg border border-transparent hover:border-rose-500/20 transition flex items-center gap-1 cursor-pointer font-bold font-sans uppercase"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'uz' ? 'O\'chirish' : 'Remove Dish'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
