import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  Coffee, 
  Flame, 
  GlassWater, 
  Cake, 
  Utensils, 
  Cookie,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { MenuItem, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatRupiah } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface MenuGridProps {
  menuItems: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  menuItems,
  onSelectItem,
  onQuickAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'semua' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'GlassWater': return <GlassWater className="w-4 h-4" />;
      case 'Cake': return <Cake className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Cookie': return <Cookie className="w-4 h-4" />;
      default: return <Coffee className="w-4 h-4" />;
    }
  };

  const handleCardClick = (item: MenuItem) => {
    if (!item.isAvailable) return;
    // If item has customizable options, open customizer modal
    if (
      item.hasTemperatureOption ||
      item.hasSugarOption ||
      item.hasMilkOption ||
      (item.addons && item.addons.length > 0)
    ) {
      onSelectItem(item);
    } else {
      sounds.playBeep();
      onQuickAdd(item);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-50/50">
      {/* Category selector & Search bar */}
      <div className="p-4 lg:p-5 border-b border-stone-200/80 bg-white/95 backdrop-blur-xs space-y-3 shrink-0">
        {/* Search input */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="menu-search-input"
              type="text"
              placeholder="Cari menu kopi, pastry, makanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-stone-900 placeholder:text-stone-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-xs font-semibold text-stone-500 hidden sm:block whitespace-nowrap bg-stone-100 px-3 py-2 rounded-xl border border-stone-200">
            {filteredItems.length} Pilihan
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 border border-stone-200/60'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-stone-300">
            <Coffee className="w-10 h-10 text-stone-300 mb-2" />
            <p className="font-semibold text-stone-800">Menu tidak ditemukan</p>
            <p className="text-xs text-stone-500 mt-1">
              Coba kata kunci lain atau pilih kategori lain
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const hasCustomization =
                item.hasTemperatureOption ||
                item.hasSugarOption ||
                item.hasMilkOption ||
                (item.addons && item.addons.length > 0);

              return (
                <div
                  key={item.id}
                  id={`menu-card-${item.id}`}
                  onClick={() => handleCardClick(item)}
                  className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-150 overflow-hidden cursor-pointer ${
                    item.isAvailable
                      ? 'border-stone-200/80 hover:border-amber-700/40 hover:shadow-md active:scale-[0.98]'
                      : 'border-stone-200 opacity-60 cursor-not-allowed bg-stone-50'
                  }`}
                >
                  {/* Image container */}
                  <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-bold rounded-md uppercase tracking-wider">
                          Habis
                        </span>
                      </div>
                    )}

                    {hasCustomization && item.isAvailable && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/75 backdrop-blur-xs text-stone-100 text-[10px] font-semibold flex items-center gap-1">
                        <SlidersHorizontal className="w-3 h-3 text-amber-300" />
                        <span>Opsi</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1 group-hover:text-amber-900 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-700 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-600 font-medium block">Harga</span>
                        <span className="text-sm font-bold text-stone-900">
                          {formatRupiah(item.price)}
                        </span>
                      </div>

                      {item.isAvailable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasCustomization) {
                              onSelectItem(item);
                            } else {
                              sounds.playBeep();
                              onQuickAdd(item);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-900 hover:text-white transition-colors flex items-center justify-center font-bold"
                          title="Tambah ke pesanan"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
