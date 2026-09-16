import React, { useState, useEffect } from 'react';
import { 
  MenuItem, 
  CartItem, 
  Order, 
  TableItem, 
  CafeSettings, 
  SelectedModifier, 
  OrderType, 
  PaymentType 
} from './types';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  DEFAULT_SETTINGS, 
  getSampleOrders 
} from './data/initialData';
import { generateOrderId } from './utils/formatters';
import { sounds } from './utils/audio';

import { Header } from './components/Header';
import { MenuGrid } from './components/MenuGrid';
import { ItemCustomizerModal } from './components/ItemCustomizerModal';
import { CartSidebar } from './components/CartSidebar';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { TableManagementView } from './components/TableManagementView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { ReportsView } from './components/ReportsView';
import { MenuManagementView } from './components/MenuManagementView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<'pos' | 'tables' | 'history' | 'reports' | 'menu-mgmt' | 'settings'>('pos');

  // Persistence: Menu Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_cafe_menu');
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // Persistence: Tables
  const [tables, setTables] = useState<TableItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_cafe_tables');
      return saved ? JSON.parse(saved) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  // Persistence: Settings
  const [settings, setSettings] = useState<CafeSettings>(() => {
    try {
      const saved = localStorage.getItem('pos_cafe_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Persistence: Orders & Transactions History
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('pos_cafe_orders');
      return saved ? JSON.parse(saved) : getSampleOrders();
    } catch {
      return getSampleOrders();
    }
  });

  // Active POS Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_cafe_active_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTable, setSelectedTable] = useState<string>('M-01');
  const [customerName, setCustomerName] = useState<string>('');
  const [discountType, setDiscountType] = useState<'none' | 'percent10' | 'flat10k' | 'custom'>('none');
  const [customDiscountAmount, setCustomDiscountAmount] = useState<number>(0);

  // Modals & Drawers
  const [customizerItem, setCustomizerItem] = useState<MenuItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('pos_cafe_menu', JSON.stringify(menuItems));
    } catch {}
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_cafe_tables', JSON.stringify(tables));
    } catch {}
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_cafe_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_cafe_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_cafe_active_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Cart Management
  const handleAddToCart = (item: MenuItem, quantity: number, modifiers: SelectedModifier) => {
    // calculate unit modifier price
    const milkExtraPrice = modifiers.milkType?.includes('Oat') ? 6000 : modifiers.milkType?.includes('Almond') ? 7000 : 0;
    const addonsExtraPrice = (item.addons || [])
      .filter((a) => modifiers.addons?.includes(a.name))
      .reduce((sum, a) => sum + a.priceDelta, 0);

    const unitPrice = item.price + milkExtraPrice + addonsExtraPrice;
    const itemTotal = unitPrice * quantity;

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItem: item,
      quantity,
      modifiers,
      itemTotal,
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  const handleQuickAdd = (item: MenuItem) => {
    handleAddToCart(item, 1, {});
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) => {
        if (it.id === cartItemId) {
          const unitPrice = it.itemTotal / it.quantity;
          return {
            ...it,
            quantity: newQty,
            itemTotal: unitPrice * newQty,
          };
        }
        return it;
      })
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCustomerName('');
    setDiscountType('none');
    setCustomDiscountAmount(0);
  };

  // Grand Total Calculation for Payment
  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  let discountAmount = 0;
  if (discountType === 'percent10') discountAmount = Math.round(subtotal * 0.1);
  else if (discountType === 'flat10k') discountAmount = Math.min(10000, subtotal);
  else if (discountType === 'custom') discountAmount = Math.min(customDiscountAmount, subtotal);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const serviceAmount = orderType === 'dine_in' && settings.serviceRatePercent > 0
    ? Math.round((taxableAmount * settings.serviceRatePercent) / 100)
    : 0;
  const taxAmount = settings.taxRatePercent > 0
    ? Math.round(((taxableAmount + serviceAmount) * settings.taxRatePercent) / 100)
    : 0;
  const grandTotal = taxableAmount + serviceAmount + taxAmount;

  // Table Actions
  const handleSaveToTable = () => {
    if (!selectedTable) {
      alert('Silakan pilih nomor meja terlebih dahulu');
      return;
    }
    if (cartItems.length === 0) return;

    sounds.playSuccess();
    const orderId = generateOrderId();
    const heldOrder: Order = {
      id: orderId,
      orderNumber: orders.length + 1,
      createdAt: new Date().toISOString(),
      orderType: 'dine_in',
      tableNumber: selectedTable,
      customerName: customerName.trim() || `Tamu Meja ${selectedTable}`,
      items: [...cartItems],
      subtotal,
      discountAmount,
      taxAmount,
      serviceAmount,
      grandTotal,
      paymentType: 'cash',
      amountPaid: 0,
      changeAmount: 0,
      cashierName: settings.cashierName,
      status: 'hold',
    };

    // Update orders & table occupancy
    setOrders((prev) => [heldOrder, ...prev.filter((o) => !(o.tableNumber === selectedTable && o.status === 'hold'))]);
    setTables((prev) =>
      prev.map((t) =>
        t.number === selectedTable
          ? { ...t, status: 'occupied', currentOrderId: orderId, customerName: heldOrder.customerName }
          : t
      )
    );

    // Reset current active cart
    handleClearCart();
    alert(`Pesanan telah disimpan ke Meja ${selectedTable}.`);
  };

  const handleSelectTableForOrder = (tableNumber: string) => {
    setSelectedTable(tableNumber);
    setOrderType('dine_in');

    // Check if there is already a held order for this table
    const existingHeldOrder = orders.find((o) => o.tableNumber === tableNumber && o.status === 'hold');
    if (existingHeldOrder) {
      setCartItems(existingHeldOrder.items);
      setCustomerName(existingHeldOrder.customerName || '');
    }
    setCurrentTab('pos');
  };

  const handleClearTableStatus = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: 'available', currentOrderId: undefined, customerName: undefined }
          : t
      )
    );

    // Also close any hold order for that table
    setOrders((prev) =>
      prev.map((o) =>
        o.tableNumber === table.number && o.status === 'hold'
          ? { ...o, status: 'cancelled' }
          : o
      )
    );
  };

  const handleReserveTable = (tableId: string, guestName: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: 'reserved', customerName: guestName }
          : t
      )
    );
  };

  // Payment Finalization
  const handlePaymentSuccess = (paymentType: PaymentType, amountPaid: number, changeAmount: number) => {
    const newOrder: Order = {
      id: generateOrderId(),
      orderNumber: orders.length + 1,
      createdAt: new Date().toISOString(),
      orderType,
      tableNumber: orderType === 'dine_in' ? selectedTable : undefined,
      customerName: customerName.trim() || undefined,
      items: [...cartItems],
      subtotal,
      discountAmount,
      taxAmount,
      serviceAmount,
      grandTotal,
      paymentType,
      amountPaid,
      changeAmount,
      cashierName: settings.cashierName,
      status: 'completed',
    };

    // If this table had a previous hold order, remove it
    setOrders((prev) => [
      newOrder,
      ...prev.filter((o) => !(o.tableNumber === selectedTable && o.status === 'hold')),
    ]);

    // Free the table if it was occupied
    if (orderType === 'dine_in' && selectedTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.number === selectedTable
            ? { ...t, status: 'available', currentOrderId: undefined, customerName: undefined }
            : t
        )
      );
    }

    // Set receipt for display and print
    setActiveReceiptOrder(newOrder);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
    setIsMobileCartOpen(false);

    // Reset cart
    handleClearCart();
  };

  const handleVoidOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, isAvailable: !it.isAvailable } : it))
    );
  };

  const handleSaveMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => {
      const exists = prev.some((it) => it.id === item.id);
      if (exists) {
        return prev.map((it) => (it.id === item.id ? item : it));
      }
      return [item, ...prev];
    });
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleSaveSettings = (newSettings: CafeSettings) => {
    setSettings(newSettings);
  };

  const handleResetData = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    setTables(INITIAL_TABLES);
    setSettings(DEFAULT_SETTINGS);
    setOrders(getSampleOrders());
    setCartItems([]);
    alert('Data berhasil dikembalikan ke pengaturan default.');
  };

  const occupiedTablesCount = tables.filter((t) => t.status === 'occupied').length;
  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-stone-900">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={totalCartCount}
        openCartMobile={() => setIsMobileCartOpen(true)}
        settings={settings}
        occupiedTablesCount={occupiedTablesCount}
      />

      {/* Main Screen Content View */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: POS REGISTER */}
        {currentTab === 'pos' && (
          <div className="flex-1 flex overflow-hidden w-full h-full">
            {/* Left: Menu Catalog Grid */}
            <MenuGrid
              menuItems={menuItems}
              onSelectItem={(item) => setCustomizerItem(item)}
              onQuickAdd={handleQuickAdd}
            />

            {/* Right: Cart & Billing Sidebar (Desktop) */}
            <div className="hidden lg:block h-full">
              <CartSidebar
                cartItems={cartItems}
                orderType={orderType}
                setOrderType={setOrderType}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                customerName={customerName}
                setCustomerName={setCustomerName}
                tables={tables}
                settings={settings}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onOpenPayment={() => setIsPaymentOpen(true)}
                onSaveToTable={handleSaveToTable}
                discountType={discountType}
                setDiscountType={setDiscountType}
                customDiscountAmount={customDiscountAmount}
                setCustomDiscountAmount={setCustomDiscountAmount}
              />
            </div>

            {/* Mobile Cart Drawer */}
            {isMobileCartOpen && (
              <div className="lg:hidden fixed inset-0 z-40 flex bg-stone-900/60 backdrop-blur-xs">
                <div className="ml-auto w-full max-w-sm h-full bg-white flex flex-col">
                  <CartSidebar
                    cartItems={cartItems}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    tables={tables}
                    settings={settings}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onClearCart={handleClearCart}
                    onOpenPayment={() => {
                      setIsMobileCartOpen(false);
                      setIsPaymentOpen(true);
                    }}
                    onSaveToTable={handleSaveToTable}
                    onCloseMobile={() => setIsMobileCartOpen(false)}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    customDiscountAmount={customDiscountAmount}
                    setCustomDiscountAmount={setCustomDiscountAmount}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: TABLE MANAGEMENT */}
        {currentTab === 'tables' && (
          <TableManagementView
            tables={tables}
            heldOrders={orders.filter((o) => o.status === 'hold')}
            onSelectTableForOrder={handleSelectTableForOrder}
            onClearTableStatus={handleClearTableStatus}
            onReserveTable={handleReserveTable}
          />
        )}

        {/* VIEW 3: TRANSACTION HISTORY */}
        {currentTab === 'history' && (
          <TransactionHistoryView
            orders={orders}
            settings={settings}
            onViewReceipt={(order) => {
              setActiveReceiptOrder(order);
              setIsReceiptOpen(true);
            }}
            onVoidOrder={handleVoidOrder}
          />
        )}

        {/* VIEW 4: SALES REPORTS */}
        {currentTab === 'reports' && (
          <ReportsView orders={orders} settings={settings} />
        )}

        {/* VIEW 5: MENU MANAGEMENT & INVENTORY */}
        {currentTab === 'menu-mgmt' && (
          <MenuManagementView
            menuItems={menuItems}
            onToggleAvailability={handleToggleAvailability}
            onSaveMenuItem={handleSaveMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
          />
        )}

        {/* VIEW 6: SETTINGS */}
        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Item Customizer Modal */}
      {customizerItem && (
        <ItemCustomizerModal
          item={customizerItem}
          onClose={() => setCustomizerItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          grandTotal={grandTotal}
          customerName={customerName}
          orderType={orderType}
          tableNumber={selectedTable}
          settings={settings}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Receipt Modal */}
      {isReceiptOpen && activeReceiptOrder && (
        <ReceiptModal
          order={activeReceiptOrder}
          settings={settings}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          onNewTransaction={() => {
            setIsReceiptOpen(false);
            setCurrentTab('pos');
          }}
        />
      )}
    </div>
  );
}
