
export enum UserRole {
  OWNER = 'owner',
  CUSTOMER = 'customer',
}

export type CreditStatus = 'Very Good' | 'Good' | 'Moderate' | 'Critical';

export interface User {
  name: string;
  phone?: string;
  pharmacyName?: string;
  email?: string;
  role: UserRole;
  // Extended properties for authenticated customers
  loginId?: string;
  outstandingAmount?: number;
  creditStatus?: CreditStatus;
}

export interface Customer {
  id: string;
  name: string;
  loginId: string;
  password: string; // In a real app, never store plain text passwords
  outstandingAmount: number;
  status: CreditStatus;
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  manufacturer: string;
  category?: string;
  mrp?: number;
  price: number;
  stock: number;
  offerPercentage?: number;
  freeOffer?: string; // e.g., "10+1"
}

export interface CartItem extends Product {
  quantity: number;
  unit: 'Strip' | 'Box' | 'Piece';
}

export interface Order {
  id: string;
  customer: User;
  items: CartItem[];
  totalAmount: number;
  timestamp: string;
  viewed: boolean;
  comments?: string;
  order_status?: string;
  payment_status?: string;
  delivery_status?: string;
}

export interface DbNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}
