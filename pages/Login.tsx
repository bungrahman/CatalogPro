
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User as UserIcon, Lock } from 'lucide-react';
import { User } from '../types';
import { dataService } from '../services/dataService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulated login (In real app, password check would happen)
    const user = await dataService.login(username);
    
    setLoading(false);
    if (user) {
      onLogin(user);
      navigate('/');
    } else {
      setError('Username tidak valid. Coba "admin", "user", atau "owner".');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-primary-600 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 text-white">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">CatalogPro</h1>
          <p className="text-primary-100 mt-2 text-sm">Masuk untuk mengelola inventaris Anda</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sedang Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Demo Credentials:</p>
            <p className="mt-1">Admin: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">admin</code> &bull; User: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">user</code></p>
            <p className="mt-1">(Password bebas)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
