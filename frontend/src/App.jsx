import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques (tout sur la page d'accueil)
import Home from './pages/public/Home';

// Pages utilisateur
import Dashboard from './pages/user/Dashboard';
import Pending from './pages/user/Pending';

// Pages administrateur
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

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
        {/* ==================== */}
        {/* PAGE PRINCIPALE : Inscription + Connexion */}
        {/* ==================== */}
        <Route path="/" element={<Home />} />

        {/* ==================== */}
        {/* ESPACE UTILISATEUR */}
        {/* ==================== */}
        <Route
          path="/dashboard"
          element={token && !isAdmin ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/pending"
          element={token ? <Pending /> : <Navigate to="/" />}
        />

        {/* ==================== */}
        {/* ESPACE ADMIN */}
        {/* ==================== */}
        <Route
          path="/admin"
          element={!token ? <AdminLogin /> : <Navigate to="/admin/dashboard" />}
        />
        <Route
          path="/admin/dashboard"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />}
        />

        {/* ==================== */}
        {/* REDIRECTION 404 */}
        {/* ==================== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;