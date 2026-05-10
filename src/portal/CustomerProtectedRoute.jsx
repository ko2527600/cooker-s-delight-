import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCustomer } from './CustomerContext';

const CustomerProtectedRoute = () => {
  const { customer, loading } = useCustomer();

  if (loading) return null; // CustomerProvider shows spinner

  if (!customer) {
    return <Navigate to="/portal/login" replace />;
  }

  return <Outlet />;
};

export default CustomerProtectedRoute;
