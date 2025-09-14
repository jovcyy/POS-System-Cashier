import { Product } from "../api/productAPI";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'cash' | 'digital';
  timestamp: Date;
}