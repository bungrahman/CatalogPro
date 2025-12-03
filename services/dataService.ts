import { Brand, Category, GlobalSettings, Product, Role, User } from '../types';

// Initial Data
const INITIAL_SETTINGS: GlobalSettings = {
  margin_up_percent: 60,
  interest_3_month: 10,
  interest_6_month: 28,
  interest_9_month: 35,
  interest_12_month: 42
};

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Furniture' },
  { id: '3', name: 'Appliances' }
];

const INITIAL_BRANDS: Brand[] = [
  { id: '1', name: 'Samsung' },
  { id: '2', name: 'LG' },
  { id: '3', name: 'Sharp' },
  { id: '4', name: 'IKEA' }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'LED SHARP 32BG1',
    categoryId: '1',
    brandId: '3',
    type: 'TV',
    hpp: 2220000,
    price_up_60: 3552000,
    installment_3: 1302000,
    installment_6: 758000,
    installment_9: 533000,
    installment_12: 420000,
    updatedAt: new Date().toISOString(),
    description: "A high-quality 32-inch LED TV from Sharp, featuring vivid colors and energy-saving technology."
  }
];

const USERS: User[] = [
  { id: '1', username: 'admin', role: Role.ADMIN, name: 'Administrator' },
  { id: '2', username: 'user', role: Role.USER, name: 'Sales Staff' }
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
  }

  // --- Auth ---
  async login(username: string): Promise<User | null> {
    await delay(500);
    const user = USERS.find(u => u.username === username);
    return user || null;
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
}

export const dataService = new DataService();