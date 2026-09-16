import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Printer, 
  Download, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Wallet,
  Coffee,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Order, CafeSettings } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';

interface ReportsViewProps {
  orders: Order[];
  settings: CafeSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, settings }) => {
  // Only calculate completed orders
  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'completed');
  }, [orders]);

  // Total Gross Revenue
  const totalRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  }, [completedOrders]);

  // Total Subtotal & Taxes
  const totalSubtotal = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalTax = completedOrders.reduce((sum, o) => sum + o.taxAmount, 0);
  const totalService = completedOrders.reduce((sum, o) => sum + o.serviceAmount, 0);
  const totalDiscount = completedOrders.reduce((sum, o) => sum + o.discountAmount, 0);

  // Total items sold
  const totalItemsSold = completedOrders.reduce((sum, o) => {
    return sum + o.items.reduce((iSum, it) => iSum + it.quantity, 0);
  }, 0);

  // Average basket size
  const averageOrderValue = completedOrders.length > 0
    ? Math.round(totalRevenue / completedOrders.length)
    : 0;

  // Breakdown by payment methods
  const paymentBreakdown = useMemo(() => {
    const res = {
      cash: { count: 0, amount: 0 },
      qris: { count: 0, amount: 0 },
      debit: { count: 0, amount: 0 },
      ewallet: { count: 0, amount: 0 },
    };
    completedOrders.forEach((o) => {
      if (res[o.paymentType]) {
        res[o.paymentType].count += 1;
        res[o.paymentType].amount += o.grandTotal;
      }
    });
    return res;
  }, [completedOrders]);

  // Breakdown by Order Type (Dine In vs Take Away)
  const orderTypeBreakdown = useMemo(() => {
    let dineInCount = 0;
    let takeAwayCount = 0;
    let dineInTotal = 0;
    let takeAwayTotal = 0;

    completedOrders.forEach((o) => {
      if (o.orderType === 'dine_in') {
        dineInCount += 1;
        dineInTotal += o.grandTotal;
      } else {
        takeAwayCount += 1;
        takeAwayTotal += o.grandTotal;
      }
    });

    return { dineInCount, takeAwayCount, dineInTotal, takeAwayTotal };
  }, [completedOrders]);

  // Top selling menu items ranking
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; category: string; qty: number; revenue: number }>();

    completedOrders.forEach((o) => {
      o.items.forEach((it) => {
        const key = it.menuItem.id;
        const existing = map.get(key) || {
          name: it.menuItem.name,
          category: it.menuItem.category,
          qty: 0,
          revenue: 0,
        };
        existing.qty += it.quantity;
        existing.revenue += it.itemTotal;
        map.set(key, existing);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 7);
  }, [completedOrders]);

  const handleExportCSV = () => {
    const headers = ['ID Transaksi', 'Waktu', 'Tipe', 'Meja', 'Pelanggan', 'Metode Bayar', 'Subtotal', 'Diskon', 'Pajak', 'Service', 'Total', 'Kasir'];
    const rows = completedOrders.map((o) => [
      o.id,
      formatDateTime(o.createdAt),
      o.orderType,
      o.tableNumber || '-',
      o.customerName || 'Umum',
      o.paymentType,
      o.subtotal,
      o.discountAmount,
      o.taxAmount,
      o.serviceAmount,
      o.grandTotal,
      o.cashierName,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_${settings.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-y-auto">
      {/* Top Banner with Action to Export */}
      <div className="p-4 lg:p-6 bg-white border-b border-stone-200/80 space-y-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 leading-tight">
              Laporan & Ringkasan Penjualan
            </h2>
            <p className="text-xs text-stone-700 font-medium">
              Analisis performa cafe, rincian pembayaran kasir, dan menu terlaris
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-amber-950 text-white rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Total Omset Penjualan
            </span>
            <div className="text-2xl font-black text-amber-50 mt-1">
              {formatRupiah(totalRevenue)}
            </div>
            <span className="text-[11px] text-amber-200/70 mt-1 block">
              {completedOrders.length} Transaksi Sukses
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Rata-rata Transaksi (AOV)
            </span>
            <div className="text-2xl font-black text-stone-900 mt-1">
              {formatRupiah(averageOrderValue)}
            </div>
            <span className="text-[11px] text-stone-700 mt-1 block">
              Basket size per pelanggan
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Total Item Terjual
            </span>
            <div className="text-2xl font-black text-stone-900 mt-1">
              {totalItemsSold} Pcs
            </div>
            <span className="text-[11px] text-stone-700 mt-1 block">
              Makanan & Minuman
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
              Pajak & Service Terkumpul
            </span>
            <div className="text-2xl font-black text-stone-900 mt-1">
              {formatRupiah(totalTax + totalService)}
            </div>
            <span className="text-[11px] text-stone-700 mt-1 block">
              PB1 ({formatRupiah(totalTax)}) + Service ({formatRupiah(totalService)})
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Cashier Drawer Settlement + Top Products Grid */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* Settlement by Payment Method */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Rekap Kasir Berdasarkan Metode Pembayaran
              </h3>
              <p className="text-xs text-stone-700 font-medium">
                Pencocokan uang tunai di laci kasir dan mutasi non-tunai
              </p>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Shift Kasir Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tunai */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Uang Tunai (Cash)</span>
                </span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {paymentBreakdown.cash.count} trx
                </span>
              </div>
              <div className="text-xl font-extrabold text-emerald-950 pt-1">
                {formatRupiah(paymentBreakdown.cash.amount)}
              </div>
              <p className="text-[10px] text-emerald-700 font-medium">
                Wajib ada di laci kasir fisik
              </p>
            </div>

            {/* QRIS */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1">
              <div className="flex items-center justify-between text-rose-800">
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-rose-600" />
                  <span>QRIS Digital</span>
                </span>
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {paymentBreakdown.qris.count} trx
                </span>
              </div>
              <div className="text-xl font-extrabold text-rose-950 pt-1">
                {formatRupiah(paymentBreakdown.qris.amount)}
              </div>
              <p className="text-[10px] text-rose-700 font-medium">
                Masuk otomatis ke rekening settlement
              </p>
            </div>

            {/* Debit */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1">
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Debit / EDC</span>
                </span>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {paymentBreakdown.debit.count} trx
                </span>
              </div>
              <div className="text-xl font-extrabold text-blue-950 pt-1">
                {formatRupiah(paymentBreakdown.debit.amount)}
              </div>
              <p className="text-[10px] text-blue-700 font-medium">
                Sesuai slip mesin EDC
              </p>
            </div>

            {/* E-Wallet */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-1">
              <div className="flex items-center justify-between text-purple-800">
                <span className="text-xs font-bold uppercase flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  <span>E-Wallet</span>
                </span>
                <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  {paymentBreakdown.ewallet.count} trx
                </span>
              </div>
              <div className="text-xl font-extrabold text-purple-950 pt-1">
                {formatRupiah(paymentBreakdown.ewallet.amount)}
              </div>
              <p className="text-[10px] text-purple-700 font-medium">
                GoPay / OVO / DANA merchant
              </p>
            </div>
          </div>
        </div>

        {/* Two Columns: Top Selling Items and Order Types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
            <h3 className="font-bold text-stone-900 text-sm mb-1">
              Peringkat Menu Terlaris (Top Selling)
            </h3>
            <p className="text-xs text-stone-700 font-medium mb-4">
              Menu kopi dan makanan yang paling banyak dipesan pelanggan
            </p>

            {topProducts.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                Belum ada data penjualan menu
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, index) => {
                  const maxQty = topProducts[0]?.qty || 1;
                  const percent = Math.round((p.qty / maxQty) * 100);

                  return (
                    <div key={p.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                            index === 0 ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-stone-900">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-stone-700 font-semibold">{p.qty} Pcs</span>
                          <span className="text-amber-950 font-extrabold">{formatRupiah(p.revenue)}</span>
                        </div>
                      </div>

                      {/* Visual Bar */}
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-800 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dine In vs Take Away Card */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm mb-1">
                Tipe Layanan Pesanan
              </h3>
              <p className="text-xs text-stone-700 font-medium mb-4">
                Distribusi makan di tempat vs bawa pulang
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-800">
                    <span>Makan di Tempat (Dine In)</span>
                    <span className="text-amber-900">{orderTypeBreakdown.dineInCount} Pesanan</span>
                  </div>
                  <div className="text-sm font-extrabold text-stone-900">
                    {formatRupiah(orderTypeBreakdown.dineInTotal)}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-800">
                    <span>Bawa Pulang (Take Away)</span>
                    <span className="text-amber-900">{orderTypeBreakdown.takeAwayCount} Pesanan</span>
                  </div>
                  <div className="text-sm font-extrabold text-stone-900">
                    {formatRupiah(orderTypeBreakdown.takeAwayTotal)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 text-xs text-stone-600 font-medium">
              Data dihitung secara otomatis dari seluruh transaksi aktif sesi ini.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
