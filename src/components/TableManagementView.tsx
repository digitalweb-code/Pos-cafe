import React, { useState } from 'react';
import { 
  Armchair, 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  Receipt, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { TableItem, Order } from '../types';
import { formatRupiah } from '../utils/formatters';
import { sounds } from '../utils/audio';

interface TableManagementViewProps {
  tables: TableItem[];
  heldOrders: Order[];
  onSelectTableForOrder: (tableNumber: string) => void;
  onClearTableStatus: (tableId: string) => void;
  onReserveTable: (tableId: string, guestName: string) => void;
}

export const TableManagementView: React.FC<TableManagementViewProps> = ({
  tables,
  heldOrders,
  onSelectTableForOrder,
  onClearTableStatus,
  onReserveTable,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [reserveModalTable, setReserveModalTable] = useState<TableItem | null>(null);
  const [reserveGuestName, setReserveGuestName] = useState<string>('');

  const zones = ['all', 'Indoor AC', 'Bar Area', 'Outdoor Garden'];

  const filteredTables = tables.filter((t) =>
    selectedZone === 'all' ? true : t.zone === selectedZone
  );

  const totalTables = tables.length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;
  const occupancyRate = Math.round((occupiedCount / totalTables) * 100);

  const getTableOrder = (tableNumber: string): Order | undefined => {
    return heldOrders.find((o) => o.tableNumber === tableNumber && o.status === 'hold');
  };

  const handleOpenTableOrder = (tableNumber: string) => {
    sounds.playBeep();
    onSelectTableForOrder(tableNumber);
  };

  const handleConfirmReservation = () => {
    if (!reserveModalTable || !reserveGuestName.trim()) return;
    sounds.playBeep();
    onReserveTable(reserveModalTable.id, reserveGuestName.trim());
    setReserveModalTable(null);
    setReserveGuestName('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-y-auto">
      {/* Top Banner & KPI Stat Cards */}
      <div className="p-4 lg:p-6 border-b border-stone-200/80 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 leading-tight">
              Manajemen Meja & Ruangan
            </h2>
            <p className="text-xs text-stone-700 font-medium">
              Pantau ketersediaan meja, pesanan aktif yang belum bayar, dan reservasi tamu
            </p>
          </div>

          {/* Quick Zone Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 overflow-x-auto">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => {
                  sounds.playBeep();
                  setSelectedZone(z);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedZone === z
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {z === 'all' ? 'Semua Area' : z}
              </button>
            ))}
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-stone-700 uppercase block">Total Meja</span>
            <span className="text-xl font-extrabold text-stone-900">{totalTables} Meja</span>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Meja Terisi</span>
            <span className="text-xl font-extrabold text-amber-950">{occupiedCount} Meja ({occupancyRate}%)</span>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Meja Kosong</span>
            <span className="text-xl font-extrabold text-emerald-950">{availableCount} Meja</span>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-blue-800 uppercase block">Reservasi</span>
            <span className="text-xl font-extrabold text-blue-950">{reservedCount} Meja</span>
          </div>
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div className="p-4 lg:p-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const currentOrder = getTableOrder(table.number);
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';
            const isAvailable = table.status === 'available';

            return (
              <div
                key={table.id}
                className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all duration-150 shadow-2xs hover:shadow-md ${
                  isOccupied
                    ? 'border-amber-400/80 bg-amber-50/20'
                    : isReserved
                    ? 'border-blue-300 bg-blue-50/20'
                    : 'border-stone-200/90'
                }`}
              >
                <div>
                  {/* Top line: table number, zone, capacity */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-lg font-black text-stone-900 block">
                        {table.number}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-700">
                        {table.zone}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isOccupied
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isReserved
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {isOccupied ? 'Terisi' : isReserved ? 'Reservasi' : 'Kosong'}
                      </span>
                    </div>
                  </div>

                  {/* Seat capacity & Guest info */}
                  <div className="mt-3 py-2 border-y border-stone-100 flex items-center justify-between text-xs text-stone-700">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-stone-600" />
                      <span>Kapasitas {table.capacity} Kursi</span>
                    </div>

                    {(isOccupied || isReserved) && (
                      <span className="font-bold text-stone-900 truncate max-w-[120px]">
                        {table.customerName || (currentOrder?.customerName || 'Tamu')}
                      </span>
                    )}
                  </div>

                  {/* Active Order Breakdown if Occupied */}
                  {currentOrder && (
                    <div className="mt-2.5 p-2 bg-stone-100/80 rounded-xl text-[11px] space-y-1">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>Tagihan Aktif</span>
                        <span className="text-amber-900">{formatRupiah(currentOrder.grandTotal)}</span>
                      </div>
                      <div className="text-stone-500 line-clamp-1">
                        {currentOrder.items.map((it) => `${it.quantity}x ${it.menuItem.name}`).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                  {isAvailable && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenTableOrder(table.number)}
                        className="flex-1 py-2 px-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buka Pesanan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playBeep();
                          setReserveModalTable(table);
                        }}
                        className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
                        title="Reservasi"
                      >
                        Reservasi
                      </button>
                    </>
                  )}

                  {isOccupied && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenTableOrder(table.number)}
                        className="flex-1 py-2 px-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Lihat / Bayar Bill</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Kosongkan status meja ${table.number}?`)) {
                            sounds.playRemove();
                            onClearTableStatus(table.id);
                          }
                        }}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
                        title="Kosongkan Meja"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isReserved && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenTableOrder(table.number)}
                        className="flex-1 py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Mulai Pesanan Tamu
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playRemove();
                          onClearTableStatus(table.id);
                        }}
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl"
                        title="Batalkan Reservasi"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reservation Dialog */}
      {reserveModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-stone-900 text-base">
              Reservasi Meja {reserveModalTable.number}
            </h3>
            <p className="text-xs text-stone-500">
              Kapasitas {reserveModalTable.capacity} Kursi • {reserveModalTable.zone}
            </p>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Nama Pemesan / Tamu
              </label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Hendra (4 orang)"
                value={reserveGuestName}
                onChange={(e) => setReserveGuestName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReserveModalTable(null)}
                className="px-3 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReservation}
                disabled={!reserveGuestName.trim()}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
              >
                Simpan Reservasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
