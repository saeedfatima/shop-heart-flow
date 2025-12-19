// Product type definitions for the e-commerce store

export interface ProductColor {
  name: string;
  value: string; // hex color code
}

export interface ProductSize {
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // for sale items
  description: string;
  category: string;
  images: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  inStock: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: ProductColor;
  selectedSize: ProductSize;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
