import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  SlidersHorizontal, 
  Coffee,
  Power,
  DollarSign
} from 'lucide-react';
import { MenuItem, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialData';
import { formatRupiah } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface MenuManagementViewProps {
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
  onSaveMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
}

export const MenuManagementView: React.FC<MenuManagementViewProps> = ({
  menuItems,
  onToggleAvailability,
  onSaveMenuItem,
  onDeleteMenuItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('semua');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form fields for editing/adding
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: 'coffee',
    price: 25000,
    description: '',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    hasTemperatureOption: true,
    hasSugarOption: true,
    hasMilkOption: false,
  });

  const filteredItems = menuItems.filter((it) => {
    const matchesCategory =
      selectedCategory === 'semua' || it.category === selectedCategory;
    const matchesSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    sounds.playBeep();
    setFormData({
      id: `item-${Date.now()}`,
      name: '',
      category: 'coffee',
      price: 25000,
      description: '',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
      hasTemperatureOption: true,
      hasSugarOption: true,
      hasMilkOption: false,
    });
    setIsAddingNew(true);
    setEditingItem(null);
  };

  const handleOpenEdit = (item: MenuItem) => {
    sounds.playBeep();
    setFormData({ ...item });
    setEditingItem(item);
    setIsAddingNew(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price) return;

    sounds.playBeep();
    const itemToSave: MenuItem = {
      id: formData.id || `item-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category as CategoryId,
      price: Number(formData.price),
      description: formData.description || '',
      image: formData.image || 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
      isAvailable: formData.isAvailable ?? true,
      hasTemperatureOption: formData.hasTemperatureOption,
      hasSugarOption: formData.hasSugarOption,
      hasMilkOption: formData.hasMilkOption,
      addons: formData.addons || [
        { name: 'Extra Shot Espresso', priceDelta: 5000 },
      ],
    };

    onSaveMenuItem(itemToSave);
    setIsAddingNew(false);
    setEditingItem(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-hidden">
      {/* Top action header */}
      <div className="p-4 lg:p-6 bg-white border-b border-stone-200/80 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 leading-tight">
              Kelola Menu & Ketersediaan Stok
            </h2>
            <p className="text-xs text-stone-700 font-medium">
              Ubah harga, status ketersediaan (aktif/habis), dan tambah menu baru
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-stone-900"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CategoryId)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-800"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu items listing */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-3 flex items-center justify-between gap-3 transition-all ${
                item.isAvailable ? 'border-stone-200/90' : 'border-rose-200 bg-stone-50/70'
              }`}
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 relative">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white bg-rose-600 px-1 py-0.5 rounded">
                      Habis
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Price */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-stone-900 truncate leading-snug">
                  {item.name}
                </h4>
                <span className="text-xs font-extrabold text-stone-800">
                  {formatRupiah(item.price)}
                </span>
              </div>

              {/* Actions: Toggle Stock & Edit */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playBeep();
                    onToggleAvailability(item.id);
                  }}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                  title={item.isAvailable ? 'Status: Tersedia (Klik untuk ubah jadi Habis)' : 'Status: Habis (Klik untuk ubah jadi Tersedia)'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">
                    {item.isAvailable ? 'Ada' : 'Habis'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs transition-colors"
                  title="Edit Menu"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus menu "${item.name}"?`)) {
                      sounds.playRemove();
                      onDeleteMenuItem(item.id);
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors"
                  title="Hapus Menu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddingNew || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                {isAddingNew ? 'Tambah Menu Baru' : `Edit Menu: ${editingItem?.name}`}
              </h3>
              <button
                onClick={() => { setIsAddingNew(false); setEditingItem(null); }}
                className="w-7 h-7 rounded-lg text-stone-400 hover:bg-stone-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Caramel Latte Special"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryId })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:border-amber-800"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'semua').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Harga (Rupiah)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Bahan utama, cita rasa, dan keunggulan menu..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">URL Gambar (Unsplash/Web)</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              {/* Options Toggles */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="font-bold text-stone-800 block">Kustomisasi Menu untuk Kasir:</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasTemperatureOption ?? false}
                      onChange={(e) => setFormData({ ...formData, hasTemperatureOption: e.target.checked })}
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium">Opsi Dingin / Panas</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSugarOption ?? false}
                      onChange={(e) => setFormData({ ...formData, hasSugarOption: e.target.checked })}
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium">Opsi Gula (Sugar Level)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasMilkOption ?? false}
                      onChange={(e) => setFormData({ ...formData, hasMilkOption: e.target.checked })}
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium">Opsi Susu Alternatif</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable ?? true}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="rounded text-amber-800 focus:ring-amber-800"
                    />
                    <span className="font-medium">Stok Tersedia</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => { setIsAddingNew(false); setEditingItem(null); }}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
