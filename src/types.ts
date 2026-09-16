export type CategoryId = 
  | 'semua'
  | 'coffee'
  | 'non-coffee'
  | 'manual-brew'
  | 'pastry'
  | 'food'
  | 'snacks';

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string;
}

export interface MenuItemOption {
  name: string;
  priceDelta: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
  hasTemperatureOption?: boolean; // Ice or Hot
  hasSugarOption?: boolean; // Sugar level 100%, 50%, 0%
  hasMilkOption?: boolean; // Fresh milk, Oat, Almond
  addons?: MenuItemOption[]; // Extra shot, etc.
}

export interface SelectedModifier {
  temperature?: 'Iced' | 'Hot';
  sugarLevel?: 'Normal' | 'Less Sugar (50%)' | 'No Sugar (0%)';
  milkType?: string;
  addons?: string[];
  notes?: string;
}

export interface CartItem {
  id: string; // unique cart line ID
  menuItem: MenuItem;
  quantity: number;
  modifiers: SelectedModifier;
  itemTotal: number;
}

export type OrderType = 'dine_in' | 'take_away' | 'delivery';

export type PaymentType = 'cash' | 'qris' | 'debit' | 'ewallet';

export interface Order {
  id: string; // TRX-20260916-001
  orderNumber: number;
  createdAt: string;
  orderType: OrderType;
  tableNumber?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountNote?: string;
  taxAmount: number;
  serviceAmount: number;
  grandTotal: number;
  paymentType: PaymentType;
  amountPaid: number;
  changeAmount: number;
  cashierName: string;
  status: 'completed' | 'hold' | 'cancelled';
}

export interface TableItem {
  id: string;
  number: string;
  zone: 'Indoor AC' | 'Outdoor Garden' | 'Bar Area';
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  customerName?: string;
  guestCount?: number;
}

export interface CafeSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  taxRatePercent: number; // e.g. 10
  serviceRatePercent: number; // e.g. 5
  footerNote: string;
  cashierName: string;
  wifiName: string;
  wifiPass: string;
}
