import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await api.get('/customers/auth/me');
      setCustomer(res.data);
    } catch (err) {
      setCustomer(null);
      localStorage.removeItem('cd_customer_token');
      localStorage.removeItem('cd_customer_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = (newToken, customerData) => {
    localStorage.setItem('cd_customer_token', newToken);
    localStorage.setItem('cd_customer_user', JSON.stringify(customerData));
    setCustomer(customerData);
  };

  const logout = async () => {
    try {
      await api.post('/customers/auth/logout');
    } catch (e) {}
    localStorage.removeItem('cd_customer_token');
    localStorage.removeItem('cd_customer_user');
    setCustomer(null);
    window.location.href = '/portal/login';
  };

  const refreshCustomer = () => {
    checkSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-brand-orange rounded-full animate-spin"/>
          <p className="text-white/30 text-sm">Loading CD Boat...</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerContext.Provider value={{ 
      customer, 
      loading, 
      login, 
      logout, 
      refreshCustomer 
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomer must be used within CustomerProvider');
  return context;
};
