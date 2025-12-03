
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Product, Category, Brand, Role, User } from '../types';
import { dataService } from '../services/dataService';
import { clsx } from 'clsx';

interface ProductListProps {
  user: User;
}

// Sub-component for individual product card to manage its own "Expanded" state
const ProductCard: React.FC<{
  product: Product;
  category?: Category;
  brand?: Brand;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  formatCurrency: (val: number) => string;
}> = ({ product, category, brand, isAdmin, onDelete, formatCurrency }) => {
  const [showInstallments, setShowInstallments] = useState(false);

  // Determine which image to show (Product Image > Category Image > Default Icon)
  const displayImage = product.productImage || category?.image;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            {displayImage ? (
              <img src={displayImage} alt={product.type} className="w-12 h-12 rounded-lg object-cover border border-primary-100 shadow-sm shrink-0" />
            ) : (
               <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                 <Package size={20} />
               </div>
            )}
            <div>
              {/* Title: Category + Type */}
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {category?.name || 'Item'} {product.type}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                {brand?.name}
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-1 shrink-0">
              <Link to={`/products/edit/${product.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded">
                <Edit2 size={16} />
              </Link>
              <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-600 mb-4 mt-2 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-auto pt-2 space-y-3">
          <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-500 font-medium">Harga Cash</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price_up_60)}</span>
          </div>
          
          <button 
            onClick={() => setShowInstallments(!showInstallments)}
            className="w-full flex items-center justify-between text-sm font-medium text-primary-700 bg-primary-50 px-3 py-2 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <span>{showInstallments ? 'Sembunyikan Cicilan' : 'Lihat Cicilan'}</span>
            {showInstallments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Collapsible Installment List */}
          {showInstallments && (
            <div className="space-y-2 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex justify-between items-center text-sm px-2 py-1.5 bg-gray-50 rounded border border-gray-100">
                <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">3 Bulan</span>
                <span className="font-bold text-gray-900">{formatCurrency(product.installment_3)}</span>
              </div>
              <div className="flex justify-between items-center text-sm px-2 py-1.5 bg-gray-50 rounded border border-gray-100">
                <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">6 Bulan</span>
                <span className="font-bold text-gray-900">{formatCurrency(product.installment_6)}</span>
              </div>
              <div className="flex justify-between items-center text-sm px-2 py-1.5 bg-gray-50 rounded border border-gray-100">
                <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">9 Bulan</span>
                <span className="font-bold text-gray-900">{formatCurrency(product.installment_9)}</span>
              </div>
              <div className="flex justify-between items-center text-sm px-2 py-1.5 bg-gray-50 rounded border border-gray-100">
                <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">12 Bulan</span>
                <span className="font-bold text-gray-900">{formatCurrency(product.installment_12)}</span>
              </div>
            </div>
          )}

          {/* External Link Button */}
          {product.externalLink && (
            <a 
              href={product.externalLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors"
            >
              <span>Lihat Produk</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
      {/* HPP removed from display per request */}
    </div>
  );
};

const ProductList: React.FC<ProductListProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const isAdmin = user.role === Role.ADMIN;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [p, c, b] = await Promise.all([
        dataService.getProducts(),
        Promise.resolve(dataService.getCategories()),
        Promise.resolve(dataService.getBrands())
      ]);
      setProducts(p);
      setCategories(c);
      setBrands(b);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      await dataService.deleteProduct(id);
      setProducts(await dataService.getProducts());
    }
  };

  const filteredProducts = products.filter(p => {
    // Search by Type/Model since Name is removed
    const matchesSearch = p.type.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter ? p.categoryId === catFilter : true;
    const matchesBrand = brandFilter ? p.brandId === brandFilter : true;
    return matchesSearch && matchesCat && matchesBrand;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) return <div className="flex justify-center p-12 text-gray-500">Memuat katalog...</div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari Tipe/Model..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <select 
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none flex-1 md:flex-none"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select 
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none flex-1 md:flex-none"
            >
              <option value="">Semua Merek</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {isAdmin && (
          <Link 
            to="/products/new" 
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors w-full md:w-auto shadow-sm shadow-primary-600/20"
          >
            <Plus size={18} />
            <span>Tambah Produk</span>
          </Link>
        )}
      </div>

      {/* Grid for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const category = categories.find(c => c.id === product.categoryId);
          const brand = brands.find(b => b.id === product.brandId);

          return (
            <ProductCard 
              key={product.id}
              product={product}
              category={category}
              brand={brand}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              formatCurrency={formatCurrency}
            />
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Produk tidak ditemukan</h3>
          <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter Anda.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
