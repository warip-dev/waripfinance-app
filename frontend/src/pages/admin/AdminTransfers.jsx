import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminTransfers = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTransfers();
  }, [navigate]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [pendingRes, allRes] = await Promise.all([
        axios.get('http://localhost:5001/api/transactions/admin/transfers/pending', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/transactions/admin/transfers', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setPendingTransfers(pendingRes.data.pending);
      setTransfers(allRes.data.transfers);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (transferId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/transactions/admin/transfers/${transferId}/validate`,
        { status, admin_comment: adminComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminComment('');
      setSelectedTransfer(null);
      fetchTransfers();
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  const displayTransfers = filter === 'pending' ? pendingTransfers : transfers;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-gray-400 hover:text-white">
            ← Retour
          </Link>
          <h1 className="text-3xl font-bold text-gold">💸 Gestion des virements</h1>
        </div>

        {/* Filtres */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'pending' ? 'bg-gold text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            En attente ({pendingTransfers.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-gold text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tous ({transfers.length})
          </button>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center text-gray-400">Chargement...</div>
        ) : displayTransfers.length === 0 ? (
          <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-2xl">
            Aucun virement à afficher
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-gray-300">Montant</th>
                  <th className="px-4 py-3 text-left text-gray-300">Bénéficiaire</th>
                  <th className="px-4 py-3 text-left text-gray-300">Statut</th>
                  <th className="px-4 py-3 text-left text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayTransfers.map((transfer) => (
                  <tr key={transfer.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-white">
                      {transfer.first_name} {transfer.last_name}
                    </td>
                    <td className="px-4 py-3 text-gold font-semibold">{transfer.amount} €</td>
                    <td className="px-4 py-3 text-gray-300">{transfer.recipient_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          transfer.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : transfer.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {transfer.status === 'PENDING' && '⏳ En attente'}
                        {transfer.status === 'COMPLETED' && '✅ Validé'}
                        {transfer.status === 'REJECTED' && '❌ Rejeté'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(transfer.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {transfer.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedTransfer(transfer)}
                          className="px-3 py-1 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 text-sm"
                        >
                          Traiter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de validation */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gold mb-4">Traiter le virement</h2>

            <div className="space-y-2 text-gray-300 mb-4">
              <p>
                <strong>Utilisateur :</strong> {selectedTransfer.first_name} {selectedTransfer.last_name}
              </p>
              <p>
                <strong>Montant :</strong>{' '}
                <span className="text-gold font-semibold">{selectedTransfer.amount} €</span>
              </p>
              <p>
                <strong>Bénéficiaire :</strong> {selectedTransfer.recipient_name}
              </p>
              <p>
                <strong>IBAN :</strong> {selectedTransfer.recipient_iban}
              </p>
              {selectedTransfer.reference && (
                <p>
                  <strong>Référence :</strong> {selectedTransfer.reference}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Commentaire (optionnel)</label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                rows="3"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleValidate(selectedTransfer.id, 'COMPLETED')}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ Valider
              </button>
              <button
                onClick={() => handleValidate(selectedTransfer.id, 'REJECTED')}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ❌ Rejeter
              </button>
            </div>

            <button
              onClick={() => setSelectedTransfer(null)}
              className="w-full mt-4 py-2 text-gray-400 hover:text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransfers;