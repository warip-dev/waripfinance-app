import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [btcAddress, setBtcAddress] = useState('');
  const [ethAddress, setEthAddress] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [allRes, pendingRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/pending`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(allRes.data.users);
      setPending(pendingRes.data.users);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/validate`,
        { btc_address: btcAddress, eth_address: ethAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedUser(null);
      setBtcAddress('');
      setEthAddress('');
      fetchUsers();
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  const displayUsers = filter === 'pending' ? pending : users;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-gray-400 hover:text-white">← Retour</Link>
          <h1 className="text-3xl font-bold text-gold">👥 Gestion des utilisateurs</h1>
        </div>

        <div className="flex space-x-4 mb-6">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-gold text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
            Tous ({users.length})
          </button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-gold text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
            En attente ({pending.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Chargement...</div>
        ) : displayUsers.length === 0 ? (
          <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-2xl">Aucun utilisateur à afficher</div>
        ) : (
          <div className="bg-gray-800 rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300">Nom</th>
                  <th className="px-4 py-3 text-left text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-gray-300">Statut</th>
                  <th className="px-4 py-3 text-left text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-white">{user.first_name} {user.last_name}</td>
                    <td className="px-4 py-3 text-gray-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                        {user.status === 'PENDING' ? '⏳ En attente' : '✅ Actif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      {user.status === 'PENDING' && (
                        <button onClick={() => setSelectedUser(user)} className="px-3 py-1 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 text-sm">Valider</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gold mb-4">Valider l'utilisateur</h2>
            <div className="space-y-2 text-gray-300 mb-4">
              <p><strong>Nom :</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
              <p><strong>Email :</strong> {selectedUser.email}</p>
              <p><strong>Téléphone :</strong> {selectedUser.phone}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Adresse BTC</label>
                <input type="text" value={btcAddress} onChange={(e) => setBtcAddress(e.target.value)} placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Adresse ETH</label>
                <input type="text" value={ethAddress} onChange={(e) => setEthAddress(e.target.value)} placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e" className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold" />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button onClick={() => handleValidate(selectedUser.id)} className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">✅ Valider</button>
              <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;