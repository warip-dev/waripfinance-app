const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ==========================================
// MIDDLEWARE - Vérifier authentification
// ==========================================
const verifyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: 'Compte non actif' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token invalide' });
    }
};

// ==========================================
// CRÉER UN VIREMENT
// ==========================================
router.post('/create', verifyAuth, async (req, res) => {
    try {
        const { beneficiaryName, beneficiaryLastName, iban, bic, reference, amount } = req.body;

        if (req.user.accounts.current.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Solde insuffisant'
            });
        }

        const transfer = new Transfer({
            user: req.user._id,
            beneficiaryName,
            beneficiaryLastName,
            iban,
            bic,
            reference,
            amount,
            status: 'pending'
        });

        await transfer.save();

        req.user.transactions.push({
            type: 'transfer',
            amount: amount,
            description: `Virement vers ${beneficiaryName} ${beneficiaryLastName}`,
            to: iban,
            status: 'pending'
        });
        await req.user.save();

        res.json({
            success: true,
            message: 'Virement créé avec succès, en attente de validation',
            transfer
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du virement'
        });
    }
});

// ==========================================
// LISTE DES VIREMENTS D'UN UTILISATEUR
// ==========================================
router.get('/my-transfers', verifyAuth, async (req, res) => {
    try {
        const transfers = await Transfer.find({ user: req.user._id }).sort({ date: -1 });
        res.json({ success: true, transfers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;