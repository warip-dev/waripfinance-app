import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Pages utilisateur
import Dashboard from './pages/user/Dashboard';
import Deposit from './pages/user/Deposit';
import Transfer from './pages/user/Transfer';
import Pending from './pages/user/Pending';

// Pages administrateur
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTransfers from './pages/admin/AdminTransfers';

const App = () => {
  // Récupérer les informations de l'utilisateur connecté
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'ADMIN';

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} />}
        />

        {/* Routes utilisateur */}
        <Route
          path="/dashboard"
          element={token && !isAdmin ? <Dashboard /> : <Navigate to={isAdmin ? '/admin/dashboard' : '/login'} />}
        />
        <Route
          path="/deposit"
          element={token && !isAdmin ? <Deposit /> : <Navigate to="/login" />}
        />
        <Route
          path="/transfer"
          element={token && !isAdmin ? <Transfer /> : <Navigate to="/login" />}
        />
        <Route
          path="/pending"
          element={token ? <Pending /> : <Navigate to="/login" />}
        />

        {/* Routes administrateur */}
        <Route
          path="/admin"
          element={!token ? <AdminLogin /> : <Navigate to="/admin/dashboard" />}
        />
        <Route
          path="/admin/dashboard"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />}
        />
        <Route
          path="/admin/transfers"
          element={isAdmin ? <AdminTransfers /> : <Navigate to="/admin" />}
        />

        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;