
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Wand2, Calculator, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Brand, Category, GlobalSettings, Product } from '../types';
import { dataService } from '../services/dataService';
import { generateProductDescription } from '../services/geminiService';
import { clsx } from 'clsx';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Product>>({
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
    productImage: '',
    externalLink: ''
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
    
    // Excel Formula: ROUND(((1 + Rate) * UP) / Months; -3)
    // This effectively rounds to the nearest 1000
    const calcInstallment = (price: number, interest: number, months: number) => {
       const totalWithInterest = price * (1 + (interest / 100));
       const monthlyRaw = totalWithInterest / months;
       // Javascript Round to nearest 1000 logic: Math.round(x / 1000) * 1000
       return Math.round(monthlyRaw / 1000) * 1000;
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
    if (!formData.categoryId || !formData.brandId || !formData.type) {
      alert("Mohon isi Kategori, Merek, dan Tipe terlebih dahulu.");
      return;
    }
    setGeneratingAI(true);
    const catName = categories.find(c => c.id === formData.categoryId)?.name || '';
    const brandName = brands.find(b => b.id === formData.brandId)?.name || '';
    
    const desc = await generateProductDescription(
      catName,
      brandName,
      formData.type || ''
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

  const InputField = ({ label, name, value, type = 'text', onChange, readOnly = false, prefix, placeholder }: any) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={clsx(
            "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow",
            prefix && "pl-10",
            readOnly && "bg-gray-100 text-gray-500 cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );

  // Filter brands based on selected category
  const filteredBrands = brands.filter(b => b.categoryId === formData.categoryId);

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Kembali ke Daftar
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Kategori</label>
                <select 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value, brandId: ''})} // Reset brand on category change
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Merek</label>
                <select 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.brandId}
                  onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                  required
                  disabled={!formData.categoryId}
                >
                  <option value="">{formData.categoryId ? 'Pilih Merek' : 'Pilih Kategori Dulu'}</option>
                  {filteredBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <InputField 
                label="Tipe/Model" 
                value={formData.type} 
                onChange={(e: any) => setFormData({...formData, type: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                    label="URL Gambar Produk (Opsional)" 
                    value={formData.productImage} 
                    onChange={(e: any) => setFormData({...formData, productImage: e.target.value})}
                    placeholder="https://..."
                />
                 <InputField 
                    label="Link Eksternal (Opsional)" 
                    value={formData.externalLink} 
                    onChange={(e: any) => setFormData({...formData, externalLink: e.target.value})}
                    placeholder="Link untuk tombol 'Lihat Produk'"
                />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Deskripsi</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingAI}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  <Wand2 size={12} />
                  {generatingAI ? 'Sedang membuat...' : 'Buat Otomatis dengan AI'}
                </button>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Deskripsi produk..."
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
              <Calculator size={16} /> Harga & Cicilan
            </h3>
            
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 mb-4">
              <InputField 
                label="HPP (Harga Modal)" 
                type="number" 
                value={formData.hpp} 
                onChange={handleHppChange}
                prefix="Rp"
              />
              <p className="text-xs text-primary-600 mt-2">
                * Memasukkan HPP akan otomatis menghitung Harga Jual (UP) dan Angsuran berdasarkan Pengaturan Global saat ini.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InputField 
                label="Harga Jual (UP)" 
                value={formData.price_up_60} 
                readOnly 
                prefix="Rp"
              />
              <div className="hidden md:block"></div> {/* Spacer */}
              
              <InputField 
                label="Angsuran 3 Bulan" 
                value={formData.installment_3} 
                readOnly 
                prefix="Rp"
              />
              <InputField 
                label="Angsuran 6 Bulan" 
                value={formData.installment_6} 
                readOnly 
                prefix="Rp"
              />
              <InputField 
                label="Angsuran 9 Bulan" 
                value={formData.installment_9} 
                readOnly 
                prefix="Rp"
              />
              <InputField 
                label="Angsuran 12 Bulan" 
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
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 shadow-sm shadow-primary-600/20"
            >
              <Save size={16} />
              {loading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductForm;
