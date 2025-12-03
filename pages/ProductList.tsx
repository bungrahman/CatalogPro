import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, Package } from 'lucide-react';
import { Product, Category, Brand, Role, User } from '../types';
import { dataService } from '../services/dataService';
import { clsx } from 'clsx';

interface ProductListProps {
  user: User;
}

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
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dataService.deleteProduct(id);
      setProducts(await dataService.getProducts());
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter ? p.categoryId === catFilter : true;
    const matchesBrand = brandFilter ? p.brandId === brandFilter : true;
    return matchesSearch && matchesCat && matchesBrand;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) return <div className="flex justify-center p-12 text-gray-500">Loading catalog...</div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
             <select 
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select 
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none"
            >
              <option value="">All Brands</option>
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
            <span>Add Product</span>
          </Link>
        )}
      </div>

      {/* Grid for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const category = categories.find(c => c.id === product.categoryId);
          const brand = brands.find(b => b.id === product.brandId);

          return (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold tracking-wider text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded">
                    {category?.name || 'Uncategorized'}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Link to={`/products/edit/${product.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{brand?.name} &bull; {product.type}</p>
                
                {product.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-500">Cash Price</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price_up_60)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">12 Months</div>
                      <div className="font-semibold text-gray-900">{formatCurrency(product.installment_12)}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">6 Months</div>
                      <div className="font-semibold text-gray-900">{formatCurrency(product.installment_6)}</div>
                    </div>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="bg-gray-50 px-5 py-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                   <span>HPP: {formatCurrency(product.hpp)}</span>
                   <span>Last updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;