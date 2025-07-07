import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './HalamanLogin';
import Dashboard from './HalamanUtama'; // Ganti jika nama file lain
import HalamanHutang from './HalamanHutang';
import Register from './HalamanRegister'; // Ganti jika nama file lain
import LupaSandi from './HalamanLupasandi';
import Verifikasi from './Halamanverifikasi';
import ResetPassword from './HalamanResetPassword';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Rute Publik: bisa diakses siapa saja */}
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lupasandi" element={<LupaSandi />} />
        <Route path="/verifikasi" element={<Verifikasi />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rute Terproteksi: hanya bisa diakses setelah login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Dashboard />} />
          <Route path="/hutang" element={<HalamanHutang />} />
        </Route>
        
      </Routes>
    </Router>
  );
};

export default App;