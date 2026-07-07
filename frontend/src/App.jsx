import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/public/Home';
import Dashboard from './pages/user/Dashboard';
import Pending from './pages/user/Pending';
import Admin from './pages/admin/Admin';

const App = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <BrowserRouter>
      <Routes>
        {/* SITE PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={token && !isAdmin ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/pending" element={token ? <Pending /> : <Navigate to="/" />} />

        {/* ADMIN - COMPLÈTEMENT SÉPARÉ */}
        <Route path="/admin" element={<Admin />} />

        {/* REDIRECTION */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;