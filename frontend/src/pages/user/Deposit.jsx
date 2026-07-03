import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Deposit = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState({ btc: null, eth: null });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data.user;
        setAddresses({
          btc: user.btc_address || null,
          eth: user.eth_address || null
        });
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-white">
            ← Retour
          </Link>
          <h1 className="text-3xl font-bold text-gold">📥 Déposer</h1>
        </div>

        <div className="space-y-6">
          {/* BTC */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">₿</span>
                <h2 className="text-xl font-bold text-white">Bitcoin (BTC)</h2>
              </div>
              <span className="text-sm bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                Réseau Bitcoin
              </span>
            </div>

            {addresses.btc ? (
              <div>
                <p className="text-gray-400 text-sm mb-2">Adresse de dépôt :</p>
                <div className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg">
                  <code className="flex-1 text-sm text-white break-all font-mono">
                    {addresses.btc}
                  </code>
                  <button
                    onClick={() => copyToClipboard(addresses.btc, 'btc')}
                    className="px-3 py-1 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition text-sm"
                  >
                    {copied === 'btc' ? '✅ Copié' : '📋 Copier'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Aucune adresse BTC assignée. Contactez le support.
              </p>
            )}
          </div>

          {/* ETH */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⟠</span>
                <h2 className="text-xl font-bold text-white">Ethereum (ETH)</h2>
              </div>
              <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                Réseau ERC20
              </span>
            </div>

            {addresses.eth ? (
              <div>
                <p className="text-gray-400 text-sm mb-2">Adresse de dépôt :</p>
                <div className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg">
                  <code className="flex-1 text-sm text-white break-all font-mono">
                    {addresses.eth}
                  </code>
                  <button
                    onClick={() => copyToClipboard(addresses.eth, 'eth')}
                    className="px-3 py-1 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition text-sm"
                  >
                    {copied === 'eth' ? '✅ Copié' : '📋 Copier'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Aucune adresse ETH assignée. Contactez le support.
              </p>
            )}
          </div>

          <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              ⚠️ Assurez-vous d'envoyer uniquement des {addresses.btc ? 'BTC (Bitcoin) et ETH (Ethereum)' : 'cryptomonnaies'} sur les adresses correspondantes.
              Envoyer un autre actif pourrait entraîner une perte définitive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;