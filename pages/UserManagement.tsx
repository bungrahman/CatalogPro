
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X, Edit2, Shield, User as UserIcon } from 'lucide-react';
import { Role, User } from '../types';
import { dataService } from '../services/dataService';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    role: Role.USER
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(dataService.getUsers());
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      username: user.username,
      role: user.role
    });
    setEditingId(user.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      dataService.deleteUser(id);
      loadUsers();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.name) return;

    const user: User = {
      id: editingId || Date.now().toString(),
      name: formData.name!,
      username: formData.username!,
      role: formData.role || Role.USER,
    };

    dataService.saveUser(user);
    loadUsers();
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', role: Role.USER });
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pengguna Sistem</h2>
          <p className="text-sm text-gray-500">Kelola akses dan peran untuk aplikasi.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">{editingId ? 'Edit Pengguna' : 'Pengguna Baru'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={!!editingId} // Prevent changing username on edit
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Peran (Role)</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={Role.USER}>User (Sales)</option>
                <option value={Role.ADMIN}>Administrator</option>
                <option value={Role.OWNER}>Owner (Laporan Saja)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Admin:</strong> Akses penuh. <strong>Owner:</strong> Hanya Laporan & Produk. <strong>User:</strong> Hanya Produk.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Save size={18} />
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === Role.ADMIN ? 'bg-purple-100 text-purple-600' : user.role === Role.OWNER ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                  {user.role === Role.ADMIN ? <Shield size={20} /> : <UserIcon size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    user.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 
                    user.role === Role.OWNER ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(user)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded"
                >
                  <Edit2 size={16} />
                </button>
                {user.username !== 'admin' && ( // Prevent deleting main admin
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-auto pt-3 border-t border-gray-100">
               <div className="text-sm text-gray-500">
                 Username: <span className="font-medium text-gray-700">{user.username}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
