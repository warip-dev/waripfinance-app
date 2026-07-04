import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Pending = () => {
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
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userData = response.data.user;
                setUser(userData);

                // Si le compte est actif, rediriger vers le dashboard
                if (userData.status === 'ACTIVE') {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Erreur:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-gold text-xl">Chargement...</div>
            </div>
        );
    }

    // Si l'utilisateur est rejeté
    if (user?.status === 'BLOCKED') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-8 md:p-10 rounded-2xl max-w-md w-full text-center">
                    <div className="text-6xl mb-6">❌</div>
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Compte rejeté</h2>
                    <p className="text-gray-400 mb-4">
                        Votre compte a été rejeté par notre équipe.
                    </p>
                    {user.admin_comment && (
                        <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300 mb-4">
                            <span className="font-semibold">Motif :</span> {user.admin_comment}
                        </div>
                    )}
                    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                        <Link to="/" className="text-gold hover:underline">Retour à l'accueil</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Si l'utilisateur est en attente
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 md:p-10 rounded-2xl max-w-md w-full text-center">
                <div className="text-6xl mb-6">⏳</div>
                <h2 className="text-2xl font-bold text-yellow-500 mb-4">Compte en attente de validation</h2>
                <div className="space-y-3 text-gray-300">
                    <p className="text-lg">✅ Votre inscription a bien été enregistrée !</p>
                    <div className="flex items-center justify-center gap-2 my-4">
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-gray-400">
                        Votre compte est en cours de vérification par notre équipe.
                        Vous recevrez une notification dès qu'il sera validé.
                    </p>
                </div>
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <Link to="/" className="text-gold hover:underline">Retour à l'accueil</Link>
                </div>
                <p className="text-sm text-gray-500 mt-4">Merci de votre confiance, L'équipe Warip Finance</p>
            </div>
        </div>
    );
};

export default Pending;