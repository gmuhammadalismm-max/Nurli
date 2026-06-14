export type Language = 'uz' | 'en';

export type TableStatus = 'free' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  name: string;
  seatsCount: number | string;
  status: TableStatus;
  currentOrderValue?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'taomlar' | 'ichimliklar' | 'shirinliklar' | 'fastfood';
  description: string;
  isAvailable: boolean;
  image?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  status: 'pending' | 'ready' | 'served' | 'paid' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  date: string;
  time: string;
  waiterName: string;
  paymentMethod?: 'cash' | 'card' | 'click' | 'payme';
  notes?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  tableId: string;
  tableName: string;
  date: string;
  time: string;
  guestsCount: number | string;
  status: 'confirmed' | 'cancelled' | 'attended';
  notes?: string;
}

export interface Stats {
  activeOrdersCount: number;
  busyTablesCount: number;
  dailyRevenue: number;
  monthlyRevenue: number[];
}
