import React, { useState } from 'react';
import { 
  Search, 
  History, 
  Printer, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Wallet
} from 'lucide-react';
import { Order, CafeSettings } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface TransactionHistoryViewProps {
  orders: Order[];
  settings: CafeSettings;
  onViewReceipt: (order: Order) => void;
  onVoidOrder: (orderId: string) => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  orders,
  settings,
  onViewReceipt,
  onVoidOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.tableNumber && order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPayment =
      paymentFilter === 'all' || order.paymentType === paymentFilter;

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesPayment && matchesStatus;
  });

  const getPaymentBadge = (type: string) => {
    switch (type) {
      case 'cash':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <Banknote className="w-3 h-3 text-emerald-600" />
            <span>Tunai</span>
          </span>
        );
      case 'qris':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
            <QrCode className="w-3 h-3 text-rose-600" />
            <span>QRIS</span>
          </span>
        );
      case 'debit':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
            <CreditCard className="w-3 h-3 text-blue-600" />
            <span>Debit</span>
          </span>
        );
      case 'ewallet':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
            <Wallet className="w-3 h-3 text-purple-600" />
            <span>E-Wallet</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 lg:p-6 bg-white border-b border-stone-200/80 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 leading-tight">
              Riwayat Transaksi
            </h2>
            <p className="text-xs text-stone-700 font-medium">
              Semua arsip struk penjualan kasir, pembayaran, dan pencetakan ulang
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
              Total {filteredOrders.length} Struk
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari no. struk, nama pelanggan, nomor meja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 text-stone-900"
            />
          </div>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-800"
          >
            <option value="all">Semua Metode Bayar</option>
            <option value="cash">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="debit">Debit / EDC</option>
            <option value="ewallet">E-Wallet</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-800"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Lunas (Selesai)</option>
            <option value="cancelled">Dibatalkan (Void)</option>
          </select>
        </div>
      </div>

      {/* Orders List Table / Card View */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {filteredOrders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-stone-300 text-stone-400">
            <History className="w-10 h-10 text-stone-300 mb-2" />
            <p className="font-semibold text-stone-700">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-stone-500 mt-1">
              Cobalah ubah filter pencarian atau buat transaksi baru dari kasir
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isCancelled = order.status === 'cancelled';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 hover:shadow-sm ${
                    isCancelled ? 'border-rose-200 bg-rose-50/20 opacity-75' : 'border-stone-200/90'
                  }`}
                >
                  {/* Left Column: ID, Time, Table, Customer, Items preview */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {order.id}
                      </span>
                      {getPaymentBadge(order.paymentType)}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isCancelled ? 'Dibatalkan' : 'Lunas'}
                      </span>
                      <span className="text-[11px] font-medium text-stone-500">
                        {order.orderType === 'dine_in'
                          ? `Dine In • Meja ${order.tableNumber || '-'}`
                          : 'Take Away'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-700 font-medium">
                      Pelanggan: <span className="text-stone-900 font-semibold">{order.customerName || 'Umum'}</span> • Kasir: {order.cashierName} • {formatDateTime(order.createdAt)}
                    </div>

                    {/* Items Summary line */}
                    <div className="text-xs text-stone-600 line-clamp-1">
                      {order.items.map((it) => `${it.quantity}x ${it.menuItem.name}`).join(', ')}
                    </div>
                  </div>

                  {/* Right Column: Amount & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 shrink-0 gap-2">
                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 block font-medium">Total Tagihan</span>
                      <span className="text-base font-black text-stone-900">
                        {formatRupiah(order.grandTotal)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playBeep();
                          onViewReceipt(order);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-colors"
                        title="Lihat & Cetak Struk"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin membatalkan/void transaksi ${order.id}?`)) {
                              sounds.playRemove();
                              onVoidOrder(order.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                          title="Void / Batalkan Transaksi"
                        >
                          Void
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
