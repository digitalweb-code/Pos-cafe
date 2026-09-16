import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  LayoutGrid, 
  Armchair, 
  History, 
  BarChart3, 
  UtensilsCrossed, 
  Settings,
  Clock,
  User,
  ShoppingBag
} from 'lucide-react';
import { CafeSettings } from '../types';

interface HeaderProps {
  currentTab: 'pos' | 'tables' | 'history' | 'reports' | 'menu-mgmt' | 'settings';
  setCurrentTab: (tab: 'pos' | 'tables' | 'history' | 'reports' | 'menu-mgmt' | 'settings') => void;
  cartCount: number;
  openCartMobile?: () => void;
  settings: CafeSettings;
  occupiedTablesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  openCartMobile,
  settings,
  occupiedTablesCount,
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        new Intl.DateTimeFormat('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'pos' as const, label: 'Kasir (POS)', icon: LayoutGrid },
    { 
      id: 'tables' as const, 
      label: 'Meja', 
      icon: Armchair, 
      badge: occupiedTablesCount > 0 ? occupiedTablesCount : undefined 
    },
    { id: 'history' as const, label: 'Riwayat', icon: History },
    { id: 'reports' as const, label: 'Laporan', icon: BarChart3 },
    { id: 'menu-mgmt' as const, label: 'Kelola Menu', icon: UtensilsCrossed },
    { id: 'settings' as const, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 select-none">
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900 text-amber-50 flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="font-bold text-stone-900 leading-tight tracking-tight text-base sm:text-lg">
              {settings.name}
            </h1>
            <p className="text-xs text-stone-700 font-medium hidden sm:block">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-800' : 'text-stone-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-amber-600 text-white rounded-full text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Info: Live Time, Cashier & Mobile Cart Trigger */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-stone-700 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/60">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>{timeString}</span>
          </div>

          <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200/70 text-amber-950 px-3 py-1.5 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 text-xs font-bold">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-none">
              <span className="text-[10px] text-amber-700 block font-semibold uppercase tracking-wider">Kasir Aktif</span>
              <span className="text-xs font-bold text-amber-950">{settings.cashierName.split(' ')[0]}</span>
            </div>
          </div>

          {/* Mobile Cart Button */}
          {openCartMobile && (
            <button
              onClick={openCartMobile}
              className="lg:hidden relative flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-800 text-white font-medium text-xs shadow-sm hover:bg-amber-900"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pesanan</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-amber-900 font-bold flex items-center justify-center text-[11px]">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Scrollable Strip */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-stone-100 gap-1.5 bg-stone-50 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
