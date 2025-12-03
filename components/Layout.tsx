import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Package, Settings, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { Role, User } from '../types';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label, restrictedTo }: { to: string, icon: any, label: string, restrictedTo?: Role[] }) => {
    if (restrictedTo && user && !restrictedTo.includes(user.role)) return null;
    
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1",
          isActive 
            ? "bg-primary-50 text-primary-700 font-medium" 
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Package className="fill-current" />
            <span>CatalogPro</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <UserIcon size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>

          <nav>
            <NavItem to="/" icon={LayoutDashboard} label="Products" />
            <NavItem 
              to="/settings" 
              icon={Settings} 
              label="Settings & Master" 
              restrictedTo={[Role.ADMIN]} 
            />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8 sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 ml-2 lg:ml-0">
            {location.pathname === '/' ? 'Product Catalog' : 
             location.pathname.includes('settings') ? 'System Settings' : 
             location.pathname.includes('new') ? 'New Product' : 
             location.pathname.includes('edit') ? 'Edit Product' : 'Dashboard'}
          </h1>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;