
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  OWNER = 'OWNER'
}

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
  password?: string; // Simple mock password
}

export interface Category {
  id: string;
  name: string;
  image?: string; // Base64 or URL
}

export interface Brand {
  id: string;
  name: string;
  categoryId: string; // Linked to Category
}

export interface GlobalSettings {
  margin_up_percent: number; // Margin for Price UP 60
  interest_3_month: number;
  interest_6_month: number;
  interest_9_month: number;
  interest_12_month: number;
}

export interface Product {
  id: string;
  // name field removed
  categoryId: string;
  brandId: string;
  productImage?: string; // URL Image
  externalLink?: string; // URL for "Lihat Produk"
  description?: string; // AI Generated
  type: string;
  hpp: number; // Base Cost
  price_up_60: number; // Calculated
  installment_3: number;
  installment_6: number;
  installment_9: number;
  installment_12: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO Date
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  pic: string; // Person In Charge
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
