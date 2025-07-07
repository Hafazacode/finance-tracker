import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Cek apakah ada token di localStorage
  const token = localStorage.getItem('userToken');

  // Jika ada token, izinkan akses ke halaman "anak" (menggunakan <Outlet />)
  // Jika tidak ada token, alihkan (redirect) ke halaman login ('/')
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;