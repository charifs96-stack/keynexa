/**
 * Global type definitions for KeyNexa ecommerce application
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image?: string;
  images?: string[];
  badge?: string;
  inStock: boolean;
  sku?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Product image metadata stored in storage
 */
export interface ProductImage {
  fileName: string;
  publicUrl: string;
  path: string;
  uploadedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  shippingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: "customer" | "admin";
  addresses?: Address[];
  createdAt: Date;
}

export interface LayoutProps {
  children: React.ReactNode;
  params?: Record<string, string | string[]>;
}
