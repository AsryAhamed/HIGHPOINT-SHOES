import type { ReactNode } from "react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Size {
  id: string;
  label: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  subcategory_id: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  categories?: Category;
  subcategories?: Subcategory;
  product_sizes?: { sizes: Size }[];
}

export interface Banner {
  subtitle: ReactNode;
  description: ReactNode;
  id: string;
  title: string | null;
  image_url: string;
  link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  product_id: string | null;
  size_id: string | null;
  quantity: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes: string | null;
  created_at: string;
  customers?: Customer;
  products?: Product;
  sizes?: Size;
}

export interface CartItem {
  product: Product;
  selectedSize: Size;
  quantity: number;
}

export interface WhatsAppOrderData {
  productName: string;
  selectedSize: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}