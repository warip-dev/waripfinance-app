const User = require('../models/User');

// Récupérer tous les utilisateurs (avec pagination)
const getAllUsers = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const users = await User.findAll(limit, offset);
        res.json({ users });
    } catch (error) {
        console.error('Erreur récupération utilisateurs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
};

// Récupérer les utilisateurs en attente
const getPendingUsers = async (req, res) => {
    try {
        const users = await User.findPending();
        res.json({ users });
    } catch (error) {
        console.error('Erreur récupération utilisateurs en attente:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
};

// Récupérer les utilisateurs actifs
const getActiveUsers = async (req, res) => {
    try {
        const users = await User.findActive();
        res.json({ users });
    } catch (error) {
        console.error('Erreur récupération utilisateurs actifs:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
};

// Valider ou rejeter un utilisateur
const validateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_comment } = req.body;

        if (!['ACTIVE', 'BLOCKED'].includes(status)) {
            return res.status(400).json({ error: 'Statut invalide. Utilisez ACTIVE ou BLOCKED' });
        }

        const user = await User.updateStatus(id, status, admin_comment);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
            message: `✅ Utilisateur ${status === 'ACTIVE' ? 'validé' : 'rejeté'} avec succès`,
            user
        });

    } catch (error) {
        console.error('Erreur validation utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la validation' });
    }
};

// Récupérer les détails d'un utilisateur
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Erreur récupération détails:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération' });
    }
};

module.exports = {
    getAllUsers,
    getPendingUsers,
    getActiveUsers,
    validateUser,
    getUserDetails
};