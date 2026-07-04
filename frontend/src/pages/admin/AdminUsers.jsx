import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminComment, setAdminComment] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/pending`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data.users);
            } catch (error) {
                console.error('Erreur:', error);
                if (error.response?.status === 403) {
                    navigate('/dashboard');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

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
            // Rafraîchir la liste
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.users);
        } catch (error) {
            console.error('Erreur validation:', error);
            alert('Erreur lors de la validation');
        }
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
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin" className="text-gray-400 hover:text-white">← Retour</Link>
                    <h1 className="text-3xl font-bold text-gold">👥 Utilisateurs en attente</h1>
                </div>

                {users.length === 0 ? (
                    <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-2xl">
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
                                        <th className="px-4 py-3 text-left text-gray-300">Actions</th>
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
                                placeholder="Motif du rejet ou information..."
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

export default AdminUsers;