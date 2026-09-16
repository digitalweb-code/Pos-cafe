import React, { useState, useEffect } from 'react';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentType, CafeSettings } from '../types';
import { formatRupiah } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  customerName: string;
  orderType: string;
  tableNumber: string;
  settings: CafeSettings;
  onPaymentSuccess: (paymentType: PaymentType, amountPaid: number, changeAmount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  customerName,
  orderType,
  tableNumber,
  settings,
  onPaymentSuccess,
}) => {
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [cashGiven, setCashGiven] = useState<number>(grandTotal);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [qrisScanned, setQrisScanned] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [selectedWallet, setSelectedWallet] = useState<string>('GoPay');
  const [refNumber, setRefNumber] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    // Default cash given to nearest 10k or exact grandTotal
    setCashGiven(grandTotal);
    setQrisScanned(false);
    setIsProcessing(false);
  }, [grandTotal, isOpen]);

  if (!isOpen) return null;

  // Quick cash suggestion chips
  const quickCashOptions = [
    grandTotal,
    Math.ceil(grandTotal / 10000) * 10000,
    Math.ceil(grandTotal / 50000) * 50000,
    100000,
    200000,
  ].filter((v, idx, arr) => v >= grandTotal && arr.indexOf(v) === idx).slice(0, 4);

  const changeAmount = Math.max(0, cashGiven - grandTotal);
  const isCashSufficient = cashGiven >= grandTotal;

  const handleConfirmPayment = () => {
    if (paymentType === 'cash' && !isCashSufficient) {
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Trigger sounds and celebration
      sounds.playSuccess();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#78350f', '#d97706', '#f59e0b', '#10b981'],
        });
      } catch {
        // ignore if confetti fails
      }

      const paid = paymentType === 'cash' ? cashGiven : grandTotal;
      const change = paymentType === 'cash' ? changeAmount : 0;
      onPaymentSuccess(paymentType, paid, change);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="payment-modal-box"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Proses Pembayaran
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600 font-medium">
              <span>{orderType === 'dine_in' ? `Dine In • Meja ${tableNumber || '-'}` : 'Bawa Pulang (Take Away)'}</span>
              <span>•</span>
              <span>Pelanggan: {customerName || 'Umum'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-200/70 hover:bg-stone-300/80 text-stone-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount to Pay Spotlight */}
        <div className="bg-amber-950 text-white p-6 text-center">
          <span className="text-xs uppercase tracking-widest text-amber-200 font-semibold block mb-1">
            Total Tagihan
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-50">
            {formatRupiah(grandTotal)}
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-4 p-2 bg-stone-100 gap-1 border-b border-stone-200">
          {[
            { id: 'cash' as const, label: 'Tunai', icon: Banknote },
            { id: 'qris' as const, label: 'QRIS', icon: QrCode },
            { id: 'debit' as const, label: 'Debit / EDC', icon: CreditCard },
            { id: 'ewallet' as const, label: 'E-Wallet', icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = paymentType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playBeep();
                  setPaymentType(tab.id);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-amber-950 shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-amber-800' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Payment Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: TUNAI / CASH */}
          {paymentType === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase block mb-1.5">
                  Uang Diterima dari Pelanggan
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-lg font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* Quick Nominal Chips */}
              <div>
                <span className="text-[11px] font-semibold text-stone-700 block mb-1.5">
                  Pilihan Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickCashOptions.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        sounds.playBeep();
                        setCashGiven(amount);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        cashGiven === amount
                          ? 'bg-amber-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {amount === grandTotal ? 'Uang Pas' : formatRupiah(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change / Kembalian Calculation Display */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isCashSufficient
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}>
                <div className="flex items-center gap-2">
                  {isCashSufficient ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <div>
                    <span className="text-xs font-semibold block">
                      {isCashSufficient ? 'Kembalian Pelanggan' : 'Uang Kurang'}
                    </span>
                    <span className="text-xs text-stone-500">
                      {isCashSufficient ? 'Wajib diserahkan ke pelanggan' : 'Kurang dari total tagihan'}
                    </span>
                  </div>
                </div>

                <div className="text-xl font-extrabold">
                  {isCashSufficient ? formatRupiah(changeAmount) : formatRupiah(grandTotal - cashGiven)}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QRIS */}
          {paymentType === 'qris' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-white p-4 border-2 border-stone-200 rounded-2xl shadow-sm flex flex-col items-center">
                <div className="flex items-center gap-1.5 mb-2 font-bold text-xs text-stone-800">
                  <span className="text-rose-600 font-extrabold tracking-wider">QRIS</span>
                  <span>PEMBAYARAN DIGITAL</span>
                </div>

                {/* QR Code graphic mockup */}
                <div className="w-48 h-48 bg-stone-900 rounded-xl p-3 flex flex-col justify-between items-center relative overflow-hidden shadow-inner">
                  {/* Outer QR stylized border pattern */}
                  <div className="w-full h-full bg-white p-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-10 h-10 border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                      <div className="w-10 h-10 border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                    </div>
                    {/* Middle grid dots */}
                    <div className="grid grid-cols-6 gap-1 p-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className={`h-2 rounded-xs ${i % 2 === 0 || i % 5 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-10 h-10 border-4 border-black p-1"><div className="w-full h-full bg-black"></div></div>
                      <span className="text-[9px] font-bold text-stone-600">NMID: ID102004</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold text-stone-800 mt-2">
                  {settings.name}
                </p>
                <p className="text-[11px] text-stone-500">
                  Mendukung GoPay, OVO, ShopeePay, BCA Mobile, Livin, dll.
                </p>
              </div>

              <div className="w-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playBeep();
                    setQrisScanned(true);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    qrisScanned
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{qrisScanned ? 'Status: Notifikasi Pembayaran Berhasil' : 'Simulasikan Pembayaran QR Diterima'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DEBIT / EDC */}
          {paymentType === 'debit' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase block mb-1.5">
                  Pilih Mesin EDC / Bank
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        selectedBank === bank
                          ? 'border-amber-900 bg-amber-50 text-amber-900'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 uppercase block mb-1.5">
                  Nomor Approval / Nomor Kartu (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: APPR-948210 / 4 digit kartu"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
            </div>
          )}

          {/* TAB 4: E-WALLET */}
          {paymentType === 'ewallet' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase block mb-1.5">
                  Pilih E-Wallet
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['GoPay', 'OVO', 'ShopeePay', 'DANA'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`py-2 rounded-xl text-xs font-bold border ${
                        selectedWallet === w
                          ? 'border-amber-900 bg-amber-50 text-amber-900'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 uppercase block mb-1.5">
                  Nomor Handphone / ID Transaksi E-Wallet
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Complete Payment Button */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors"
          >
            Kembali
          </button>

          <button
            type="button"
            disabled={
              isProcessing ||
              (paymentType === 'cash' && !isCashSufficient)
            }
            onClick={handleConfirmPayment}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-amber-900 hover:bg-amber-950 disabled:opacity-40 disabled:hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Pembayaran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Pembayaran ({formatRupiah(grandTotal)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
