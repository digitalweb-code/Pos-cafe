import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Sparkles, MessageSquare } from 'lucide-react';
import { MenuItem, SelectedModifier } from '../types';
import { formatRupiah } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, modifiers: SelectedModifier) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [temperature, setTemperature] = useState<'Iced' | 'Hot'>('Iced');
  const [sugarLevel, setSugarLevel] = useState<'Normal' | 'Less Sugar (50%)' | 'No Sugar (0%)'>('Normal');
  const [milkType, setMilkType] = useState<string>('Susu Sapi Segar (Fresh Milk)');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (!item) return;
    // Reset state when a new item is selected
    setQuantity(1);
    setTemperature(item.category === 'manual-brew' ? 'Hot' : 'Iced');
    setSugarLevel('Normal');
    setMilkType('Susu Sapi Segar (Fresh Milk)');
    setSelectedAddons([]);
    setNotes('');
  }, [item]);

  if (!item) return null;

  // Calculate live item price including addons and milk
  const milkExtraPrice = milkType.includes('Oat') ? 6000 : milkType.includes('Almond') ? 7000 : 0;
  
  const addonsExtraPrice = (item.addons || [])
    .filter((a) => selectedAddons.includes(a.name))
    .reduce((sum, a) => sum + a.priceDelta, 0);

  const singleItemPrice = item.price + milkExtraPrice + addonsExtraPrice;
  const totalPrice = singleItemPrice * quantity;

  const toggleAddon = (name: string) => {
    sounds.playBeep();
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleConfirm = () => {
    sounds.playBeep();
    onAddToCart(item, quantity, {
      temperature: item.hasTemperatureOption ? temperature : undefined,
      sugarLevel: item.hasSugarOption ? sugarLevel : undefined,
      milkType: item.hasMilkOption && milkType !== 'Susu Sapi Segar (Fresh Milk)' ? milkType : undefined,
      addons: selectedAddons.length > 0 ? selectedAddons : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="item-customizer-modal"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header with Image & Title */}
        <div className="relative h-44 bg-stone-900 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex flex-col justify-end p-5">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
              Kustomisasi Menu
            </span>
            <h2 className="text-xl font-bold text-white leading-tight">
              {item.name}
            </h2>
            <p className="text-xs text-stone-200 mt-0.5">
              Harga dasar: {formatRupiah(item.price)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/60 text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Options Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Temperature Option (Iced / Hot) */}
          {item.hasTemperatureOption && (
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                Suhu Penyajian
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Iced', 'Hot'] as const).map((temp) => (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => {
                      sounds.playBeep();
                      setTemperature(temp);
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      temperature === temp
                        ? 'border-amber-800 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{temp === 'Iced' ? '🧊 Dingin (Iced)' : '☕ Panas (Hot)'}</span>
                    {temperature === temp && <Check className="w-3.5 h-3.5 text-amber-800" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugar Level */}
          {item.hasSugarOption && (
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                Tingkat Gula (Sugar Level)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Normal', label: 'Normal (100%)' },
                  { id: 'Less Sugar (50%)', label: 'Less (50%)' },
                  { id: 'No Sugar (0%)', label: 'No Sugar (0%)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      sounds.playBeep();
                      setSugarLevel(s.id as any);
                    }}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                      sugarLevel === s.id
                        ? 'border-amber-800 bg-amber-50 text-amber-900'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {item.hasMilkOption && (
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                Pilihan Susu
              </label>
              <div className="space-y-1.5">
                {[
                  { name: 'Susu Sapi Segar (Fresh Milk)', extra: 0 },
                  { name: 'Oat Milk (Gluten-Free)', extra: 6000 },
                  { name: 'Almond Milk (Nutty)', extra: 7000 },
                ].map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      sounds.playBeep();
                      setMilkType(m.name);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      milkType === m.name
                        ? 'border-amber-800 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-stone-500 font-semibold">
                      {m.extra > 0 ? `+${formatRupiah(m.extra)}` : 'Termasuk'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons list */}
          {item.addons && item.addons.length > 0 && (
            <div>
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                Tambahan / Extra Topping
              </label>
              <div className="space-y-1.5">
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.name);
                  return (
                    <button
                      key={addon.name}
                      type="button"
                      onClick={() => toggleAddon(addon.name)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isChecked
                          ? 'border-amber-800 bg-amber-50/70 text-amber-950 font-bold'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-amber-800 border-amber-800 text-white' : 'border-stone-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-stone-600 font-semibold">
                        {addon.priceDelta > 0 ? `+${formatRupiah(addon.priceDelta)}` : 'Gratis'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barista / Kitchen Notes */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              <span>Catatan Khusus Barista / Dapur</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Es sedikit, jangan terlalu manis, bungkus terpisah..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-stone-900"
            />
          </div>
        </div>

        {/* Modal Footer with Quantity and Confirm */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0 flex items-center justify-between gap-3">
          {/* Quantity stepper */}
          <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                if (quantity > 1) {
                  sounds.playBeep();
                  setQuantity(quantity - 1);
                }
              }}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-bold text-stone-900 text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playBeep();
                setQuantity(quantity + 1);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to order button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-between px-4 py-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <span>Tambahkan Pesanan</span>
            <span className="bg-amber-800/80 px-2 py-0.5 rounded-lg">
              {formatRupiah(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
