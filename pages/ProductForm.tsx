import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Wand2, Calculator } from 'lucide-react';
import { Brand, Category, GlobalSettings, Product } from '../types';
import { dataService } from '../services/dataService';
import { generateProductDescription } from '../services/geminiService';
import { clsx } from 'clsx';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    categoryId: '',
    brandId: '',
    type: '',
    hpp: 0,
    price_up_60: 0,
    installment_3: 0,
    installment_6: 0,
    installment_9: 0,
    installment_12: 0,
    description: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    const init = async () => {
      setCategories(dataService.getCategories());
      setBrands(dataService.getBrands());
      setSettings(dataService.getSettings());

      if (id) {
        const p = await dataService.getProduct(id);
        if (p) setFormData(p);
      }
    };
    init();
  }, [id]);

  const calculateValues = useCallback((hpp: number) => {
    if (!settings) return;

    const margin = settings.margin_up_percent / 100;
    const priceUp60 = hpp * (1 + margin);
    
    // Installment Formula: (Price * (1 + InterestRate)) / Months
    const calcInstallment = (price: number, interest: number, months: number) => {
       return Math.ceil((price * (1 + (interest / 100))) / months);
    };

    setFormData(prev => ({
      ...prev,
      hpp,
      price_up_60: priceUp60,
      installment_3: calcInstallment(priceUp60, settings.interest_3_month, 3),
      installment_6: calcInstallment(priceUp60, settings.interest_6_month, 6),
      installment_9: calcInstallment(priceUp60, settings.interest_9_month, 9),
      installment_12: calcInstallment(priceUp60, settings.interest_12_month, 12),
    }));
  }, [settings]);

  const handleHppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    calculateValues(val);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.categoryId || !formData.brandId) {
      alert("Please fill in Name, Category, and Brand first.");
      return;
    }
    setGeneratingAI(true);
    const catName = categories.find(c => c.id === formData.categoryId)?.name || '';
    const brandName = brands.find(b => b.id === formData.brandId)?.name || '';
    
    const desc = await generateProductDescription(
      formData.name || '',
      formData.type || '',
      catName,
      brandName
    );
    
    setFormData(prev => ({ ...prev, description: desc }));
    setGeneratingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const product: Product = {
      ...formData as Product,
      id: id || Date.now().toString(),
      updatedAt: new Date().toISOString()
    };

    await dataService.saveProduct(product);
    setLoading(false);
    navigate('/');
  };

  const InputField = ({ label, name, value, type = 'text', onChange, readOnly = false, prefix }: any) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={clsx(
            "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow",
            prefix && "pl-10",
            readOnly && "bg-gray-100 text-gray-500 cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to List
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Product Name" 
                value={formData.name} 
                onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
              />
              <InputField 
                label="Type/Model" 
                value={formData.type} 
                onChange={(e: any) => setFormData({...formData, type: e.target.value})} 
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Brand</label>
                <select 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.brandId}
                  onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingAI}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  <Wand2 size={12} />
                  {generatingAI ? 'Generating...' : 'Auto-Generate with AI'}
                </button>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Product description..."
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
              <Calculator size={16} /> Pricing & Installments
            </h3>
            
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 mb-4">
              <InputField 
                label="HPP (Cost Price)" 
                type="number" 
                value={formData.hpp} 
                onChange={handleHppChange}
                prefix="Rp"
              />
              <p className="text-xs text-primary-600 mt-2">
                * Entering HPP will automatically calculate the Selling Price and Installments based on current Global Settings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InputField 
                label="Selling Price (UP)" 
                value={formData.price_up_60} 
                readOnly 
                prefix="Rp"
              />
              <div className="hidden md:block"></div> {/* Spacer */}
              
              <InputField 
                label="3 Month Installment" 
                value={formData.installment_3} 
                readOnly 
                prefix="Rp"
              />
              <InputField 
                label="6 Month Installment" 
                value={formData.installment_6} 
                readOnly 
                prefix="Rp"
              />
              <InputField 
                label="9 Month Installment" 
                value={formData.installment_9} 
                readOnly 
                prefix="Rp"
              />
              <InputField 
                label="12 Month Installment" 
                value={formData.installment_12} 
                readOnly 
                prefix="Rp"
              />
            </div>
          </section>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 shadow-sm shadow-primary-600/20"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductForm;