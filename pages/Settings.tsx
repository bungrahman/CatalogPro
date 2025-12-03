import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Save } from 'lucide-react';
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
  const [newBrand, setNewBrand] = useState('');

  useEffect(() => {
    setSettings(dataService.getSettings());
    setCategories(dataService.getCategories());
    setBrands(dataService.getBrands());
  }, []);

  const handleSaveSettings = () => {
    dataService.saveSettings(settings);
    alert('Settings saved successfully!');
  };

  const handleAddCategory = () => {
    if (!newCat) return;
    const cat: Category = { id: Date.now().toString(), name: newCat };
    dataService.saveCategory(cat);
    setCategories(dataService.getCategories());
    setNewCat('');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete category?')) {
      dataService.deleteCategory(id);
      setCategories(dataService.getCategories());
    }
  };

  const handleAddBrand = () => {
    if (!newBrand) return;
    const brand: Brand = { id: Date.now().toString(), name: newBrand };
    dataService.saveBrand(brand);
    setBrands(dataService.getBrands());
    setNewBrand('');
  };

  const handleDeleteBrand = (id: string) => {
    if (confirm('Delete brand?')) {
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
        <TabButton id="general" label="Calculations" />
        <TabButton id="categories" label="Categories" />
        <TabButton id="brands" label="Brands" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="max-w-xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Calculation Variables</h3>
            <p className="text-sm text-gray-500">Adjust the variables used to calculate selling prices and installments.</p>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Margin (%)</label>
                <input 
                  type="number" 
                  value={settings.margin_up_percent}
                  onChange={(e) => setSettings({...settings, margin_up_percent: Number(e.target.value)})}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <p className="text-xs text-gray-400">Used to calculate Price UP from HPP.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">3-Month Interest (%)</label>
                  <input 
                    type="number" 
                    value={settings.interest_3_month}
                    onChange={(e) => setSettings({...settings, interest_3_month: Number(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">6-Month Interest (%)</label>
                  <input 
                    type="number" 
                    value={settings.interest_6_month}
                    onChange={(e) => setSettings({...settings, interest_6_month: Number(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">9-Month Interest (%)</label>
                  <input 
                    type="number" 
                    value={settings.interest_9_month}
                    onChange={(e) => setSettings({...settings, interest_9_month: Number(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">12-Month Interest (%)</label>
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
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="max-w-xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Manage Categories</h3>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="New Category Name"
                className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button 
                onClick={handleAddCategory}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700"
              >
                <Plus size={20} />
              </button>
            </div>

            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map(c => (
                <li key={c.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                  <span className="font-medium text-gray-800">{c.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="max-w-xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Manage Brands</h3>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="New Brand Name"
                className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button 
                onClick={handleAddBrand}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700"
              >
                <Plus size={20} />
              </button>
            </div>

            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {brands.map(b => (
                <li key={b.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                  <span className="font-medium text-gray-800">{b.name}</span>
                  <button 
                    onClick={() => handleDeleteBrand(b.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;