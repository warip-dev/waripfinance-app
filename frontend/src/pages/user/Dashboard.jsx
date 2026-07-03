import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
        
        // Si l'utilisateur est en attente, rediriger
        if (response.data.user.status === 'PENDING') {
          navigate('/pending');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gold text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gold">🏦 Warip Bank</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              {user?.first_name} {user?.last_name}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Solde (simulé) */}
        <div className="bg-gray-800 p-6 rounded-2xl mb-8">
          <p className="text-gray-400">Solde total</p>
          <p className="text-4xl font-bold text-gold">0,00 €</p>
          <div className="flex gap-4 mt-4">
            <span className="text-sm text-gray-400">BTC: 0,0000</span>
            <span className="text-sm text-gray-400">ETH: 0,0000</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/deposit"
            className="bg-gray-800 p-6 rounded-2xl hover:bg-gray-700 transition text-center"
          >
            <div className="text-4xl mb-2">📥</div>
            <h3 className="text-lg font-semibold text-white">Déposer</h3>
            <p className="text-gray-400 text-sm">BTC, ETH</p>
          </Link>
          <Link
            to="/transfer"
            className="bg-gray-800 p-6 rounded-2xl hover:bg-gray-700 transition text-center"
          >
            <div className="text-4xl mb-2">📤</div>
            <h3 className="text-lg font-semibold text-white">Virement</h3>
            <p className="text-gray-400 text-sm">SEPA</p>
          </Link>
        </div>

        {/* Adresses de dépôt (si assignées) */}
        {user?.btc_address && (
          <div className="mt-8 bg-gray-800 p-6 rounded-2xl">
            <h3 className="text-gold font-semibold mb-2">📍 Vos adresses de dépôt</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-500">BTC :</span>{' '}
                <span className="font-mono break-all">{user.btc_address}</span>
              </p>
              {user.eth_address && (
                <p className="text-gray-300">
                  <span className="text-gray-500">ETH :</span>{' '}
                  <span className="font-mono break-all">{user.eth_address}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;