import React, { useState } from 'react';
import { 
  Save, 
  Store, 
  Percent, 
  Receipt, 
  User, 
  Wifi, 
  RotateCcw,
  CheckCircle,
  Coffee
} from 'lucide-react';
import { CafeSettings } from '../types';
import { sounds } from '../utils/audio';

interface SettingsViewProps {
  settings: CafeSettings;
  onSaveSettings: (newSettings: CafeSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<CafeSettings>({ ...settings });
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playBeep();
    onSaveSettings(formData);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-y-auto">
      {/* Header */}
      <div className="p-4 lg:p-6 bg-white border-b border-stone-200/80 shrink-0">
        <h2 className="text-xl font-bold text-stone-900 leading-tight">
          Pengaturan Cafe & Struk POS
        </h2>
        <p className="text-xs text-stone-700 font-medium">
          Konfigurasi identitas kedai kopi, tarif pajak, nama kasir, dan format struk
        </p>
      </div>

      {/* Form Container */}
      <div className="p-4 lg:p-6 max-w-4xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Profil Cafe */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Store className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-sm text-stone-900">
                Profil Kedai Kopi / Restoran
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Nama Cafe / Brand
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pajak & Biaya Layanan */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Percent className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-sm text-stone-900">
                Pajak & Service Charge
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Pajak Restoran PB1 / PPN (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.taxRatePercent}
                    onChange={(e) => setFormData({ ...formData, taxRatePercent: Number(e.target.value) || 0 })}
                    className="w-32 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                  <span className="text-stone-500 font-semibold">% (0 untuk menonaktifkan)</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Service Charge Dine-in (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.serviceRatePercent}
                    onChange={(e) => setFormData({ ...formData, serviceRatePercent: Number(e.target.value) || 0 })}
                    className="w-32 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                  <span className="text-stone-500 font-semibold">% (Hanya berlaku untuk Dine In)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Kasir & WiFi Tamu */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <User className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-sm text-stone-900">
                Kasir & Akses WiFi Struk
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Nama Kasir Bertugas
                </label>
                <input
                  type="text"
                  value={formData.cashierName}
                  onChange={(e) => setFormData({ ...formData, cashierName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Nama WiFi Cafe (SSID)
                </label>
                <input
                  type="text"
                  value={formData.wifiName}
                  onChange={(e) => setFormData({ ...formData, wifiName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Password WiFi
                </label>
                <input
                  type="text"
                  value={formData.wifiPass}
                  onChange={(e) => setFormData({ ...formData, wifiPass: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
            </div>

            <div className="text-xs pt-2">
              <label className="font-bold text-stone-700 block mb-1">
                Pesan Footer Struk (Thank You Note)
              </label>
              <textarea
                rows={2}
                value={formData.footerNote}
                onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>
          </div>

          {/* Submit & Reset actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan semua menu, meja, dan pengaturan ke data contoh awal?')) {
                  sounds.playRemove();
                  onResetData();
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Awal</span>
            </button>

            <div className="w-full sm:w-auto flex items-center gap-3">
              {showSavedNotification && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Pengaturan Tersimpan!</span>
                </span>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
