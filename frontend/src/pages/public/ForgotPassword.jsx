import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            setSuccess(response.data.message);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🔑</div>
                    <h1 className="text-2xl font-bold text-gold">Mot de passe oublié</h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-900/50 border border-green-500 text-green-300 p-3 rounded-lg mb-4 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
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
                        {loading ? '⏳ Envoi...' : '📧 Envoyer le lien'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link to="/" className="text-gray-400 hover:text-gold text-sm transition">
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;