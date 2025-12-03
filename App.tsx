import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import SettingsPage from './pages/Settings';
import UserManagement from './pages/UserManagement';
import FinancialReport from './pages/FinancialReport';
import Login from './pages/Login';
import { Role, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('catalog_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('catalog_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('catalog_user');
  };

  if (isLoading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* Protected Routes */}
        <Route
          path="*"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<ProductList user={user} />} />
                  
                  {/* Admin Only Routes */}
                  {user.role === Role.ADMIN && (
                    <>
                      <Route path="/products/new" element={<ProductForm />} />
                      <Route path="/products/edit/:id" element={<ProductForm />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/users" element={<UserManagement />} />
                    </>
                  )}

                  {/* Admin and Owner Routes */}
                  {(user.role === Role.ADMIN || user.role === Role.OWNER) && (
                    <Route path="/reports" element={<FinancialReport user={user} />} />
                  )}
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;