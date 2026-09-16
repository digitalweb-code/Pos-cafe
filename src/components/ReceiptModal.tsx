import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  PlusCircle, 
  Coffee, 
  Share2,
  Wifi
} from 'lucide-react';
import { Order, CafeSettings } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';

interface ReceiptModalProps {
  order: Order | null;
  settings: CafeSettings;
  isOpen: boolean;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  onNewTransaction,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `==============================`,
      `       ${settings.name.toUpperCase()}       `,
      `   ${settings.tagline}   `,
      `   ${settings.address}   `,
      `   Telp: ${settings.phone}   `,
      `==============================`,
      `No. Struk : ${order.id}`,
      `Waktu     : ${formatDateTime(order.createdAt)}`,
      `Kasir     : ${order.cashierName}`,
      `Tipe      : ${order.orderType === 'dine_in' ? 'Dine In' : 'Take Away'}`,
      order.tableNumber ? `Meja      : ${order.tableNumber}` : '',
      order.customerName ? `Pelanggan : ${order.customerName}` : '',
      `------------------------------`,
      ...order.items.map((it) => {
        const itemLine = `${it.quantity}x ${it.menuItem.name}`.padEnd(20, ' ') + formatRupiah(it.itemTotal);
        const mods = [
          it.modifiers.temperature,
          it.modifiers.sugarLevel,
          it.modifiers.milkType,
          it.modifiers.addons?.join(', '),
        ].filter(Boolean).join(' • ');
        return mods ? `${itemLine}\n   (${mods})` : itemLine;
      }),
      `------------------------------`,
      `Subtotal        : ${formatRupiah(order.subtotal)}`,
      order.discountAmount > 0 ? `Diskon          : -${formatRupiah(order.discountAmount)}` : '',
      order.serviceAmount > 0 ? `Service (${settings.serviceRatePercent}%): ${formatRupiah(order.serviceAmount)}` : '',
      order.taxAmount > 0 ? `Pajak (${settings.taxRatePercent}%)  : ${formatRupiah(order.taxAmount)}` : '',
      `==============================`,
      `TOTAL AKHIR     : ${formatRupiah(order.grandTotal)}`,
      `Metode Bayar    : ${order.paymentType.toUpperCase()}`,
      `Bayar           : ${formatRupiah(order.amountPaid)}`,
      `Kembali         : ${formatRupiah(order.changeAmount)}`,
      `==============================`,
      `WiFi: ${settings.wifiName} | Pass: ${settings.wifiPass}`,
      `\n${settings.footerNote}`,
      `==============================`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentLabel = {
    cash: 'TUNAI',
    qris: 'QRIS',
    debit: 'DEBIT / EDC',
    ewallet: 'E-WALLET',
  }[order.paymentType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="receipt-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header toolbar */}
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-100 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-stone-800">
              Transaksi Berhasil
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyText}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/80 text-xs font-semibold flex items-center gap-1"
              title="Salin Struk Digital"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-stone-500 hover:bg-stone-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-200/40 flex justify-center">
          {/* Authentic Thermal Receipt Paper */}
          <div 
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white p-5 rounded-lg shadow-sm font-mono text-[11px] text-stone-800 leading-normal border border-stone-200"
          >
            {/* Cafe Logo & Header */}
            <div className="text-center pb-3 border-b border-dashed border-stone-300">
              <div className="w-9 h-9 rounded-full bg-amber-900 text-amber-200 flex items-center justify-center mx-auto mb-1.5">
                <Coffee className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-stone-900 uppercase tracking-tight">
                {settings.name}
              </h2>
              <p className="text-[10px] text-stone-500">{settings.tagline}</p>
              <p className="text-[10px] text-stone-500">{settings.address}</p>
              <p className="text-[10px] text-stone-500">Telp: {settings.phone}</p>
            </div>

            {/* Receipt Info Meta */}
            <div className="py-2.5 border-b border-dashed border-stone-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-stone-500">No. Nota</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Waktu</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Kasir</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Layanan</span>
                <span className="font-semibold">{order.orderType === 'dine_in' ? 'Dine In' : 'Take Away'}</span>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between font-bold text-amber-900">
                  <span>Meja</span>
                  <span>{order.tableNumber}</span>
                </div>
              )}
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Pelanggan</span>
                  <span>{order.customerName}</span>
                </div>
              )}
            </div>

            {/* Line items list */}
            <div className="py-3 border-b border-dashed border-stone-300 space-y-2">
              {order.items.map((item, idx) => {
                const mods = [
                  item.modifiers.temperature,
                  item.modifiers.sugarLevel,
                  item.modifiers.milkType,
                  item.modifiers.addons?.join(', '),
                ].filter(Boolean).join(' • ');

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span className="truncate pr-2">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="shrink-0">{formatRupiah(item.itemTotal)}</span>
                    </div>

                    {mods && (
                      <div className="text-[9px] text-stone-500 pl-4">
                        + {mods}
                      </div>
                    )}
                    {item.modifiers.notes && (
                      <div className="text-[9px] text-stone-400 pl-4 italic">
                        "{item.modifiers.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals Calculation */}
            <div className="py-2.5 border-b border-dashed border-stone-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-stone-500">Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Diskon Promo</span>
                  <span>-{formatRupiah(order.discountAmount)}</span>
                </div>
              )}
              {order.serviceAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Service Charge ({settings.serviceRatePercent}%)</span>
                  <span>{formatRupiah(order.serviceAmount)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Pajak PB1 ({settings.taxRatePercent}%)</span>
                  <span>{formatRupiah(order.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-stone-200 text-stone-950">
                <span>TOTAL</span>
                <span>{formatRupiah(order.grandTotal)}</span>
              </div>
            </div>

            {/* Payment & Change breakdown */}
            <div className="py-2 border-b border-dashed border-stone-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-stone-500">Pembayaran</span>
                <span className="font-semibold">{paymentLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Jumlah Diterima</span>
                <span>{formatRupiah(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Kembalian</span>
                <span>{formatRupiah(order.changeAmount)}</span>
              </div>
            </div>

            {/* Footer & Wifi Info */}
            <div className="pt-3 text-center space-y-1.5 text-[9px] text-stone-500">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-stone-700 bg-stone-100 py-1 rounded">
                <Wifi className="w-3 h-3 text-amber-800" />
                <span>WiFi: {settings.wifiName} | Pass: {settings.wifiPass}</span>
              </div>
              <p className="leading-snug pt-1">{settings.footerNote}</p>
              <p className="text-[8px] text-stone-400">Powered by POS Cafe Modern</p>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-2 shrink-0 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk (Print)</span>
          </button>

          <button
            type="button"
            onClick={onNewTransaction}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
