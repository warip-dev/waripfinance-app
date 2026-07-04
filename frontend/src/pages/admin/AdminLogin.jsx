import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email,
                password
            });

            const user = response.data.user;

            // Vérifier que c'est bien un admin
            if (user.role !== 'ADMIN') {
                setError('Accès refusé. Vous n\'êtes pas administrateur.');
                setLoading(false);
                return;
            }

            // Stocker les informations
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(user));

            // Rediriger vers le dashboard admin
            navigate('/admin/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

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

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    Accès réservé aux administrateurs
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;