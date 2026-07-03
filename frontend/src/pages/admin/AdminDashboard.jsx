import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, pending: 0, pendingTransfers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, pendingRes, transfersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/pending`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/admin/transfers/pending`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setStats({
          users: usersRes.data.users.length,
          pending: pendingRes.data.users.length,
          pendingTransfers: transfersRes.data.pending.length
        });
      } catch (error) {
        if (error.response?.status === 403) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gold">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gold">🏦 Administration</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Admin</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Déconnexion</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm">Utilisateurs</p>
            <p className="text-3xl font-bold text-white">{stats.users}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm">En attente de validation</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl">
            <p className="text-gray-400 text-sm">Virements en attente</p>
            <p className="text-3xl font-bold text-gold">{stats.pendingTransfers}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/users" className="bg-gray-800 p-6 rounded-2xl hover:bg-gray-700 transition text-center">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="text-lg font-semibold text-white">Gérer les utilisateurs</h3>
            <p className="text-gray-400 text-sm">Valider les comptes</p>
          </Link>
          <Link to="/admin/transfers" className="bg-gray-800 p-6 rounded-2xl hover:bg-gray-700 transition text-center">
            <div className="text-4xl mb-2">💸</div>
            <h3 className="text-lg font-semibold text-white">Gérer les virements</h3>
            <p className="text-gray-400 text-sm">Valider ou rejeter</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;