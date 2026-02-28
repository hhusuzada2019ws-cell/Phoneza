import React from 'react';
import { Navigate } from 'react-router-dom';

export function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('adminData');

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export function UserRoute({ children }) {
  const token = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
