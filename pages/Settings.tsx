
import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Save, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Brand, Category, GlobalSettings } from '../types';
import { dataService } from '../services/dataService';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'brands'>('general');
  const [settings, setSettings] = useState<GlobalSettings>({
    margin_up_percent: 0,
    interest_3_month: 0,
    interest_6_month: 0,
    interest_9_month: 0,
    interest_12_month: 0
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Temp inputs for adding new
  const [newCat, setNewCat] = useState('');
  const [newCatImage, setNewCatImage] = useState<string>('');
  
  const [newBrand, setNewBrand] = useState('');
  const [newBrandCategory, setNewBrandCategory] = useState('');

  useEffect(() => {
    setSettings(dataService.getSettings());
    setCategories(dataService.getCategories());
    setBrands(dataService.getBrands());
  }, []);

  const handleSaveSettings = () => {
    dataService.saveSettings(settings);
    alert('Pengaturan berhasil disimpan!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
        alert("Gambar terlalu besar. Harap gunakan gambar di bawah 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCatImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (!newCat) return;
    const cat: Category = { 
      id: Date.now().toString(), 
      name: newCat,
      image: newCatImage
    };
    dataService.saveCategory(cat);
    setCategories(dataService.getCategories());
    setNewCat('');
    setNewCatImage('');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Hapus kategori ini?')) {
      dataService.deleteCategory(id);
      setCategories(dataService.getCategories());
    }
  };

  const handleAddBrand = () => {
    if (!newBrand || !newBrandCategory) return;
    const brand: Brand = { 
      id: Date.now().toString(), 
      name: newBrand,
      categoryId: newBrandCategory
    };
    dataService.saveBrand(brand);
    setBrands(dataService.getBrands());
    setNewBrand('');
    setNewBrandCategory('');
  };

  const handleDeleteBrand = (id: string) => {
    if (confirm('Hapus merek ini?')) {
      dataService.deleteBrand(id);
      setBrands(dataService.getBrands());
    }
  };

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-primary-50 text-primary-700' 
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <TabButton id="general" label="Perhitungan" />
        <TabButton id="categories" label="Kategori" />
        <TabButton id="brands" label="Merek" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="max-w-xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Variabel Perhitungan</h3>
            <p className="text-sm text-gray-500">Sesuaikan variabel yang digunakan untuk menghitung harga jual dan angsuran.</p>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Margin (%)</label>
                <input 
                  type="number" 
                  value={settings.margin_up_percent}
                  onChange={(e) => setSettings({...settings, margin_up_percent: Number(e.target.value)})}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <p className="text-xs text-gray-400">Digunakan untuk menghitung Harga Jual (UP) dari HPP.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Bunga 3 Bulan (%)</label>
                  <input 
                    type="number" 
                    value={settings.interest_3_month}
                    onChange={(e) => setSettings({...settings, interest_3_month: Number(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Bunga 6 Bulan (%)</label>
                  <input 
                    type="number" 
                    value={settings.interest_6_month}
                    onChange={(e) => setSettings({...settings, interest_6_month: Number(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Bunga 9 Bulan (%)</label>
                  <input 
                    type="number" 
                    value={settings.interest_9_month}
                    onChange={(e) => setSettings({...settings, interest_9_month: Number(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Bunga 12 Bulan (%)</label>
                  <input 
                    type="number" 
                    value={settings.interest_12_month}
                    onChange={(e) => setSettings({...settings, interest_12_month: Number(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                className="mt-4 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="max-w-xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Kelola Kategori</h3>
            
            <div className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="relative group shrink-0">
                <div className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-white ${newCatImage ? 'border-primary-500' : 'border-gray-300'}`}>
                  {newCatImage ? (
                    <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-400" size={18} />
                  )}
                </div>
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Upload size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {newCatImage && (
                  <button 
                    onClick={() => setNewCatImage('')} 
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"
                    title="Hapus gambar"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>

              <input 
                type="text" 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Nama Kategori Baru"
                className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm h-10"
              />
              <button 
                onClick={handleAddCategory}
                disabled={!newCat}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 flex items-center justify-center shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>

            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map(c => (
                <li key={c.id} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-3 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-8 h-8 rounded object-cover border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageIcon size={14} />
                      </div>
                    )}
                    <span className="font-medium text-gray-800">{c.name}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">Belum ada kategori.</p>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="max-w-xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Kelola Merek</h3>
            
            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex gap-2">
                <select
                  value={newBrandCategory}
                  onChange={(e) => setNewBrandCategory(e.target.value)}
                  className="w-1/3 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                  type="text" 
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Nama Merek Baru"
                  className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button 
                  onClick={handleAddBrand}
                  disabled={!newBrand || !newBrandCategory}
                  className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed w-10 shrink-0 flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {brands.map(b => {
                const cat = categories.find(c => c.id === b.categoryId);
                return (
                  <li key={b.id} className="flex justify-between items-center bg-white border border-gray-100 px-4 py-3 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2">
                       <span className="font-medium text-gray-800">{b.name}</span>
                       {cat && <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{cat.name}</span>}
                    </div>
                    <button 
                      onClick={() => handleDeleteBrand(b.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
              {brands.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">Belum ada merek.</p>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
