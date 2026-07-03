import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/user/Dashboard';
import Deposit from './pages/user/Deposit';
import Transfer from './pages/user/Transfer';
import Pending from './pages/user/Pending';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransfers from './pages/admin/AdminTransfers';

const App = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/deposit" element={token ? <Deposit /> : <Navigate to="/login" />} />
        <Route path="/transfer" element={token ? <Transfer /> : <Navigate to="/login" />} />
        <Route path="/pending" element={token ? <Pending /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token && user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin/users" element={token && user?.role === 'ADMIN' ? <AdminUsers /> : <Navigate to="/" />} />
        <Route path="/admin/transfers" element={token && user?.role === 'ADMIN' ? <AdminTransfers /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;