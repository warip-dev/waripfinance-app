import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  // Vérifier si l'admin est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.role === 'ADMIN') {
      setIsLoggedIn(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      });

      const user = response.data.user;

      if (user.role !== 'ADMIN') {
        setError('Accès refusé. Vous n\'êtes pas administrateur.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoggedIn(true);
      fetchUsers();

    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (userId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/validate`,
        { status, admin_comment: adminComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminComment('');
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsers([]);
  };

  // ============================================
  // PAGE DE CONNEXION ADMIN
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">👑</div>
            <h1 className="text-3xl font-bold text-gold">Administration</h1>
            <p className="text-gray-400 mt-2">Espace réservé aux administrateurs</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@waripfinance.com"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-lg transition ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gold text-gray-900 hover:bg-yellow-500'
              }`}
            >
              {loading ? '⏳ Connexion...' : '🔑 Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            <a href="/" className="text-gold hover:underline">← Retour à l'accueil</a>
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // TABLEAU DE BORD ADMIN (après connexion)
  // ============================================
  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gold">👑 Administration</h1>
            <p className="text-gray-400">Gestion des utilisateurs inscrits</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Déconnexion
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-2xl mb-6">
          <p className="text-gray-400">Utilisateurs en attente de validation</p>
          <p className="text-3xl font-bold text-gold">{users.length}</p>
        </div>

        {users.length === 0 ? (
          <div className="text-center text-gray-400 bg-gray-800 p-12 rounded-2xl">
            🎉 Aucun utilisateur en attente de validation
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300">Nom</th>
                    <th className="px-4 py-3 text-left text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-gray-300">Téléphone</th>
                    <th className="px-4 py-3 text-left text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-white">{user.first_name} {user.last_name}</td>
                      <td className="px-4 py-3 text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-gray-300">{user.phone}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-4 py-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition text-sm font-semibold"
                        >
                          🔍 Traiter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 text-sm text-gray-500 border-t border-gray-700">
              Total : {users.length} utilisateur{users.length > 1 ? 's' : ''} en attente
            </div>
          </div>
        )}
      </div>

      {/* Modal de validation */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gold mb-4">Traiter l'utilisateur</h2>

            <div className="space-y-2 text-gray-300 mb-6">
              <p><strong>Nom :</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
              <p><strong>Email :</strong> {selectedUser.email}</p>
              <p><strong>Téléphone :</strong> {selectedUser.phone}</p>
              <p><strong>Inscription :</strong> {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Commentaire (optionnel)</label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Motif du rejet..."
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleValidate(selectedUser.id, 'ACTIVE')}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                ✅ Valider
              </button>
              <button
                onClick={() => handleValidate(selectedUser.id, 'BLOCKED')}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                ❌ Rejeter
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedUser(null);
                setAdminComment('');
              }}
              className="w-full mt-4 py-2 text-gray-400 hover:text-white transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;