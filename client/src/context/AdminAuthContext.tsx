import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin } from '../types';

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('dewan_admin_token');
    const savedAdmin = localStorage.getItem('dewan_admin_user');

    if (savedToken && savedAdmin) {
      try {
        setToken(savedToken);
        setAdmin(JSON.parse(savedAdmin));
      } catch (err) {
        localStorage.removeItem('dewan_admin_token');
        localStorage.removeItem('dewan_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newAdmin: Admin) => {
    localStorage.setItem('dewan_admin_token', newToken);
    localStorage.setItem('dewan_admin_user', JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = () => {
    localStorage.removeItem('dewan_admin_token');
    localStorage.removeItem('dewan_admin_user');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!admin,
        isSuperAdmin: admin?.role === 'SUPER_ADMIN',
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
