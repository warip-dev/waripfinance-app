import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Transfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    recipient_name: '',
    recipient_iban: '',
    recipient_bic: '',
    reference: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/transactions/transfer',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('✅ Virement envoyé avec succès ! En attente de validation par notre équipe.');
      setFormData({
        amount: '',
        recipient_name: '',
        recipient_iban: '',
        recipient_bic: '',
        reference: ''
      });

      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi du virement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">
            ← Retour
          </Link>
          <h1 className="text-3xl font-bold text-gold">💸 Nouveau virement</h1>
        </div>

        <div className="bg-gray-800 p-6 md:p-8 rounded-2xl">
          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Montant (EUR)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Nom du bénéficiaire</label>
              <input
                type="text"
                name="recipient_name"
                value={formData.recipient_name}
                onChange={handleChange}
                placeholder="Dupont Jean"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">IBAN du bénéficiaire</label>
              <input
                type="text"
                name="recipient_iban"
                value={formData.recipient_iban}
                onChange={handleChange}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">BIC (optionnel)</label>
              <input
                type="text"
                name="recipient_bic"
                value={formData.recipient_bic}
                onChange={handleChange}
                placeholder="BNPAFRPP"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Référence (optionnel)</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Facture #12345"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-lg transition ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gold text-gray-900 hover:bg-yellow-500'
              }`}
            >
              {loading ? '⏳ Envoi en cours...' : '📤 Envoyer le virement'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Tous les virements sont soumis à validation par notre équipe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Transfer;