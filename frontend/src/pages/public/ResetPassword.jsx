import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Token manquant');
                setVerifying(false);
                return;
            }

            try {
                const response = await axios.get(`/api/auth/verify-reset-token?token=${token}`);
                if (response.data.valid) {
                    setTokenValid(true);
                }
            } catch (err) {
                setError('Lien invalide ou expiré');
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/auth/reset-password', {
                token,
                newPassword,
                confirmPassword
            });

            setSuccess('✅ Mot de passe réinitialisé avec succès !');
            setTimeout(() => navigate('/'), 3000);

        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la réinitialisation');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-gold text-xl">⏳ Vérification du lien...</div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="text-5xl mb-3">❌</div>
                    <h1 className="text-2xl font-bold text-red-500">Lien invalide</h1>
                    <p className="text-gray-400 mt-2">
                        {error || 'Ce lien de réinitialisation est invalide ou a expiré.'}
                    </p>
                    <a href="/" className="text-gold hover:underline mt-4 block">
                        Retour à l'accueil
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🔐</div>
                    <h1 className="text-2xl font-bold text-gold">Nouveau mot de passe</h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Saisissez votre nouveau mot de passe ci-dessous.
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
                        <label className="block text-gray-300 mb-2 text-sm">Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                            required
                            minLength="8"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? '⏳ Réinitialisation...' : '🔑 Réinitialiser'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="/" className="text-gray-400 hover:text-gold text-sm transition">
                        ← Retour à l'accueil
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;