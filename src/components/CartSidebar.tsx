import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  Coffee, 
  User, 
  Armchair, 
  Save, 
  Percent,
  X
} from 'lucide-react';
import { CartItem, OrderType, TableItem, CafeSettings } from '../types';
import { formatRupiah } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface CartSidebarProps {
  cartItems: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tables: TableItem[];
  settings: CafeSettings;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenPayment: () => void;
  onSaveToTable: () => void;
  onCloseMobile?: () => void;
  discountType: 'none' | 'percent10' | 'flat10k' | 'custom';
  setDiscountType: (type: 'none' | 'percent10' | 'flat10k' | 'custom') => void;
  customDiscountAmount: number;
  setCustomDiscountAmount: (amount: number) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cartItems,
  orderType,
  setOrderType,
  selectedTable,
  setSelectedTable,
  customerName,
  setCustomerName,
  tables,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenPayment,
  onSaveToTable,
  onCloseMobile,
  discountType,
  setDiscountType,
  customDiscountAmount,
  setCustomDiscountAmount,
}) => {
  const [showDiscountMenu, setShowDiscountMenu] = useState(false);

  // Subtotal calculation
  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

  // Discount calculation
  let discountAmount = 0;
  let discountLabel = '';
  if (discountType === 'percent10') {
    discountAmount = Math.round(subtotal * 0.1);
    discountLabel = 'Diskon 10%';
  } else if (discountType === 'flat10k') {
    discountAmount = Math.min(10000, subtotal);
    discountLabel = 'Voucher Rp 10.000';
  } else if (discountType === 'custom') {
    discountAmount = Math.min(customDiscountAmount, subtotal);
    discountLabel = 'Diskon Khusus';
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  // Service charge applied mainly to dine in
  const serviceAmount = orderType === 'dine_in' && settings.serviceRatePercent > 0
    ? Math.round((taxableAmount * settings.serviceRatePercent) / 100)
    : 0;

  // Tax calculation
  const taxAmount = settings.taxRatePercent > 0
    ? Math.round(((taxableAmount + serviceAmount) * settings.taxRatePercent) / 100)
    : 0;

  const grandTotal = taxableAmount + serviceAmount + taxAmount;
  const totalItemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <aside className="w-full lg:w-96 xl:w-104 bg-white border-l border-stone-200 flex flex-col h-full shrink-0 shadow-xs z-20">
      {/* Header of Bill */}
      <div className="p-4 border-b border-stone-200/80 bg-stone-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-sm leading-tight">
              Pesanan Aktif
            </h2>
            <span className="text-[11px] text-stone-700 font-medium">
              {totalItemCount} item dalam pesanan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {cartItems.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Kosongkan semua item pesanan saat ini?')) {
                  sounds.playRemove();
                  onClearCart();
                }
              }}
              className="p-1.5 text-stone-600 hover:text-rose-600 rounded-lg hover:bg-stone-100 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Kosongkan Pesanan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          )}

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Order Options: Dine In / Take Away & Table / Customer Info */}
      <div className="p-3.5 border-b border-stone-200/80 bg-white space-y-2.5">
        {/* Order Type Pills */}
        <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-xl">
          {[
            { id: 'dine_in' as const, label: 'Dine In' },
            { id: 'take_away' as const, label: 'Take Away' },
            { id: 'delivery' as const, label: 'Delivery' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => {
                sounds.playBeep();
                setOrderType(type.id);
              }}
              className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                orderType === type.id
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Customer & Table details */}
        <div className="grid grid-cols-2 gap-2">
          {orderType === 'dine_in' ? (
            <div className="relative">
              <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                Pilih Meja
              </label>
              <div className="relative">
                <Armchair className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-800"
                >
                  <option value="">-- Meja --</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.number}>
                      {t.number} ({t.zone}) {t.status === 'occupied' ? '• Terisi' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
                Nomor Antrian
              </label>
              <div className="py-1.5 px-3 bg-stone-100 rounded-lg text-xs font-bold text-stone-800">
                Auto #{Math.floor(100 + Math.random() * 899)}
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-stone-700 uppercase block mb-1">
              Nama Pelanggan
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-800 placeholder:text-stone-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-2">
              <Coffee className="w-6 h-6 text-stone-300" />
            </div>
            <p className="text-sm font-semibold text-stone-700">Belum ada pesanan</p>
            <p className="text-xs text-stone-600 mt-1 max-w-[200px]">
              Ketuk menu di sebelah kiri untuk menambahkan ke struk pesanan
            </p>
          </div>
        ) : (
          cartItems.map((item) => {
            const hasModifierDetails =
              item.modifiers.temperature ||
              item.modifiers.sugarLevel ||
              item.modifiers.milkType ||
              (item.modifiers.addons && item.modifiers.addons.length > 0) ||
              item.modifiers.notes;

            return (
              <div
                key={item.id}
                className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-stone-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-stone-900 leading-tight">
                      {item.menuItem.name}
                    </h4>
                    <span className="text-xs text-amber-900 font-bold mt-0.5 block">
                      {formatRupiah(item.itemTotal)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playRemove();
                      onRemoveItem(item.id);
                    }}
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Modifiers tags */}
                {hasModifierDetails && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {item.modifiers.temperature && (
                      <span className={`px-1.5 py-0.5 rounded font-medium ${
                        item.modifiers.temperature === 'Iced' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {item.modifiers.temperature}
                      </span>
                    )}
                    {item.modifiers.sugarLevel && (
                      <span className="px-1.5 py-0.5 rounded bg-stone-200/60 text-stone-700 font-medium">
                        {item.modifiers.sugarLevel}
                      </span>
                    )}
                    {item.modifiers.milkType && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900 font-medium">
                        {item.modifiers.milkType}
                      </span>
                    )}
                    {item.modifiers.addons?.map((addon) => (
                      <span key={addon} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        +{addon}
                      </span>
                    ))}
                    {item.modifiers.notes && (
                      <span className="w-full text-stone-500 italic text-[10px] mt-0.5 block">
                        "{item.modifiers.notes}"
                      </span>
                    )}
                  </div>
                )}

                {/* Quantity adjuster */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                  <span className="text-[11px] text-stone-700 font-medium">
                    {formatRupiah(item.itemTotal / item.quantity)} / item
                  </span>

                  <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5">
                    <button
                      onClick={() => {
                        sounds.playBeep();
                        onUpdateQuantity(item.id, item.quantity - 1);
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playBeep();
                        onUpdateQuantity(item.id, item.quantity + 1);
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Totals & Checkout Panel */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3 shrink-0">
        {/* Voucher / Discount Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowDiscountMenu(!showDiscountMenu)}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:border-amber-700 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-800" />
              <span>{discountLabel ? `${discountLabel} (-${formatRupiah(discountAmount)})` : 'Tambah Diskon / Promo'}</span>
            </div>
            <span className="text-amber-800 text-[11px] font-bold">Ubah</span>
          </button>

          {showDiscountMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 p-2 bg-white border border-stone-200 rounded-xl shadow-lg z-30 space-y-1 text-xs">
              <p className="text-[10px] font-bold text-stone-400 uppercase px-2 py-1">Pilih Promo</p>
              <button
                onClick={() => { setDiscountType('none'); setShowDiscountMenu(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg ${discountType === 'none' ? 'bg-amber-50 font-bold text-amber-900' : 'hover:bg-stone-50'}`}
              >
                Tanpa Diskon
              </button>
              <button
                onClick={() => { setDiscountType('percent10'); setShowDiscountMenu(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg ${discountType === 'percent10' ? 'bg-amber-50 font-bold text-amber-900' : 'hover:bg-stone-50'}`}
              >
                Diskon 10% (Happy Hour)
              </button>
              <button
                onClick={() => { setDiscountType('flat10k'); setShowDiscountMenu(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg ${discountType === 'flat10k' ? 'bg-amber-50 font-bold text-amber-900' : 'hover:bg-stone-50'}`}
              >
                Voucher Member Rp 10.000
              </button>
            </div>
          )}
        </div>

        {/* Calculation summary */}
        <div className="space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-stone-900">{formatRupiah(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>{discountLabel}</span>
              <span>-{formatRupiah(discountAmount)}</span>
            </div>
          )}

          {serviceAmount > 0 && (
            <div className="flex justify-between">
              <span>Service Charge ({settings.serviceRatePercent}%)</span>
              <span className="font-medium text-stone-900">{formatRupiah(serviceAmount)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span>PB1 / Pajak ({settings.taxRatePercent}%)</span>
              <span className="font-medium text-stone-900">{formatRupiah(taxAmount)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-stone-900">Total Bayar</span>
            <span className="text-lg font-extrabold text-amber-950">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {orderType === 'dine_in' && (
            <button
              type="button"
              disabled={cartItems.length === 0}
              onClick={onSaveToTable}
              className="col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-2 bg-stone-200/80 hover:bg-stone-300/80 disabled:opacity-40 disabled:hover:bg-stone-200/80 text-stone-800 rounded-xl text-xs font-bold transition-all"
              title="Simpan pesanan ke nomor meja untuk dibayar nanti"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Hold Meja</span>
            </button>
          )}

          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={onOpenPayment}
            className={`${
              orderType === 'dine_in' ? 'col-span-2' : 'col-span-3'
            } flex items-center justify-center gap-2 py-3 px-4 bg-amber-900 hover:bg-amber-950 disabled:opacity-40 disabled:hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all`}
          >
            <span>Bayar / Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
