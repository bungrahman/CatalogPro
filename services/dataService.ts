
import { Brand, Category, GlobalSettings, Product, Role, User, Transaction } from '../types';

// Initial Data
const INITIAL_SETTINGS: GlobalSettings = {
  margin_up_percent: 60,
  interest_3_month: 10,
  interest_6_month: 28,
  interest_9_month: 35,
  interest_12_month: 42
};

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'LED' },
  { id: '2', name: 'KULKAS' },
  { id: '3', name: 'MESIN CUCI' }
];

const INITIAL_BRANDS: Brand[] = [
  { id: '1', name: 'Samsung', categoryId: '1' },
  { id: '2', name: 'LG', categoryId: '1' },
  { id: '3', name: 'Sharp', categoryId: '1' },
  { id: '4', name: 'Polytron', categoryId: '2' },
  { id: '5', name: 'Samsung', categoryId: '2' }, // Samsung also makes Fridges
  { id: '6', name: 'LG', categoryId: '3' }       // LG also makes Washing Machines
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    categoryId: '1', // LED
    brandId: '3', // Sharp (LED)
    type: '32BG1',
    hpp: 2220000,
    price_up_60: 3552000,
    installment_3: 1302000,
    installment_6: 758000,
    installment_9: 533000,
    installment_12: 420000,
    updatedAt: new Date().toISOString(),
    description: "TV LED 32 inci berkualitas tinggi dari Sharp, menampilkan warna-warna cerah dan teknologi hemat energi.",
    externalLink: "https://www.google.com"
  }
];

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', role: Role.ADMIN, name: 'Administrator' },
  { id: '2', username: 'user', role: Role.USER, name: 'Sales Staff' },
  { id: '3', username: 'owner', role: Role.OWNER, name: 'Business Owner' }
];

// Mock Transactions for Reports
const MOCK_TRANSACTIONS: Transaction[] = [
  { 
    id: 't1', date: '2023-10-15', type: 'INCOME', description: 'Penjualan LED TV Sharp 32BG1', amount: 3552000, pic: 'Sales Staff'
  },
  { 
    id: 't2', date: '2023-10-18', type: 'EXPENSE', description: 'Biaya Listrik & Air', amount: 450000, pic: 'Administrator'
  },
  { 
    id: 't3', date: '2023-11-05', type: 'INCOME', description: 'Penjualan Kulkas Samsung', amount: 4800000, pic: 'Sales Staff'
  },
  { 
    id: 't4', date: new Date().toISOString().split('T')[0], type: 'EXPENSE', description: 'Biaya Operasional Toko', amount: 200000, pic: 'Administrator'
  },
  { 
    id: 't5', date: new Date().toISOString().split('T')[0], type: 'INCOME', description: 'Penjualan Mesin Cuci LG', amount: 7200000, pic: 'Administrator'
  }
];

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service Class
class DataService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('catalog_settings')) {
      localStorage.setItem('catalog_settings', JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem('catalog_categories')) {
      localStorage.setItem('catalog_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem('catalog_brands')) {
      localStorage.setItem('catalog_brands', JSON.stringify(INITIAL_BRANDS));
    }
    if (!localStorage.getItem('catalog_products')) {
      localStorage.setItem('catalog_products', JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem('catalog_users')) {
      localStorage.setItem('catalog_users', JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem('catalog_transactions')) {
      localStorage.setItem('catalog_transactions', JSON.stringify(MOCK_TRANSACTIONS));
    }
  }

  // --- Auth & Users ---
  async login(username: string): Promise<User | null> {
    await delay(500);
    const users = this.getUsers();
    const user = users.find(u => u.username === username);
    return user || null;
  }

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem('catalog_users') || '[]');
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const existing = users.findIndex(u => u.id === user.id);
    if (existing >= 0) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('catalog_users', JSON.stringify(users));
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem('catalog_users', JSON.stringify(users));
  }

  // --- Settings ---
  getSettings(): GlobalSettings {
    const s = localStorage.getItem('catalog_settings');
    return s ? JSON.parse(s) : INITIAL_SETTINGS;
  }

  saveSettings(settings: GlobalSettings): void {
    localStorage.setItem('catalog_settings', JSON.stringify(settings));
  }

  // --- Master Data ---
  getCategories(): Category[] {
    return JSON.parse(localStorage.getItem('catalog_categories') || '[]');
  }

  saveCategory(category: Category): void {
    const cats = this.getCategories();
    const existing = cats.findIndex(c => c.id === category.id);
    if (existing >= 0) {
      cats[existing] = category;
    } else {
      cats.push(category);
    }
    localStorage.setItem('catalog_categories', JSON.stringify(cats));
  }

  deleteCategory(id: string): void {
    const cats = this.getCategories().filter(c => c.id !== id);
    localStorage.setItem('catalog_categories', JSON.stringify(cats));
  }

  getBrands(): Brand[] {
    return JSON.parse(localStorage.getItem('catalog_brands') || '[]');
  }

  saveBrand(brand: Brand): void {
    const brands = this.getBrands();
    const existing = brands.findIndex(b => b.id === brand.id);
    if (existing >= 0) {
      brands[existing] = brand;
    } else {
      brands.push(brand);
    }
    localStorage.setItem('catalog_brands', JSON.stringify(brands));
  }

  deleteBrand(id: string): void {
    const brands = this.getBrands().filter(b => b.id !== id);
    localStorage.setItem('catalog_brands', JSON.stringify(brands));
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    await delay(300);
    return JSON.parse(localStorage.getItem('catalog_products') || '[]');
  }

  async getProduct(id: string): Promise<Product | undefined> {
    await delay(200);
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  async saveProduct(product: Product): Promise<void> {
    await delay(400);
    const products = await this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem('catalog_products', JSON.stringify(products));
  }

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('catalog_products', JSON.stringify(filtered));
  }

  // --- Reports ---
  getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem('catalog_transactions') || '[]');
  }

  saveTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    const existingIndex = transactions.findIndex(t => t.id === transaction.id);
    
    if (existingIndex >= 0) {
      transactions[existingIndex] = transaction;
    } else {
      transactions.push(transaction);
    }
    
    localStorage.setItem('catalog_transactions', JSON.stringify(transactions));
  }

  deleteTransaction(id: string): void {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    localStorage.setItem('catalog_transactions', JSON.stringify(transactions));
  }
}

export const dataService = new DataService();
