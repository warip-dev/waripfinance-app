const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// ==========================================
// MIDDLEWARE - Vérifier si admin
// ==========================================
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès refusé' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token invalide' });
    }
};

// ==========================================
// STATISTIQUES
// ==========================================
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingUsers = await User.countDocuments({ status: 'pending' });
        const pendingTransfers = await Transfer.countDocuments({ status: 'pending' });
        const totalTransfers = await Transfer.countDocuments();

        res.json({
            success: true,
            stats: {
                totalUsers,
                pendingUsers,
                pendingTransfers,
                totalTransfers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// LISTE DES UTILISATEURS EN ATTENTE
// ==========================================
router.get('/pending-users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({ status: 'pending' }).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// VALIDER UN UTILISATEUR
// ==========================================
router.put('/validate-user/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        user.status = 'active';
        await user.save();

        res.json({ success: true, message: 'Compte validé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// REJETER UN UTILISATEUR
// ==========================================
router.put('/reject-user/:id', verifyAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        user.status = 'rejected';
        user.rejectionReason = reason;
        await user.save();

        res.json({ success: true, message: 'Compte rejeté' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// LISTE DES VIREMENTS EN ATTENTE
// ==========================================
router.get('/pending-transfers', verifyAdmin, async (req, res) => {
    try {
        const transfers = await Transfer.find({ status: 'pending' }).populate('user', 'firstName lastName email');
        res.json({ success: true, transfers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// VALIDER UN VIREMENT
// ==========================================
router.put('/validate-transfer/:id', verifyAdmin, async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id);
        if (!transfer) {
            return res.status(404).json({ success: false, message: 'Virement non trouvé' });
        }

        transfer.status = 'confirmed';
        await transfer.save();

        const user = await User.findById(transfer.user);
        if (user) {
            user.transactions.push({
                type: 'transfer',
                amount: transfer.amount,
                description: `Virement vers ${transfer.beneficiaryName} ${transfer.beneficiaryLastName}`,
                from: user.accounts.current.iban,
                to: transfer.iban,
                status: 'confirmed'
            });
            user.accounts.current.balance -= transfer.amount;
            await user.save();
        }

        res.json({ success: true, message: 'Virement validé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// REJETER UN VIREMENT
// ==========================================
router.put('/reject-transfer/:id', verifyAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const transfer = await Transfer.findById(req.params.id);
        if (!transfer) {
            return res.status(404).json({ success: false, message: 'Virement non trouvé' });
        }

        transfer.status = 'rejected';
        transfer.rejectionReason = reason;
        await transfer.save();

        res.json({ success: true, message: 'Virement rejeté' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// MODIFIER LES ADRESSES CRYPTO
// ==========================================
router.put('/crypto-addresses', verifyAdmin, async (req, res) => {
    try {
        const { btcAddress, ethAddress } = req.body;
        
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }
        
        settings.btcAddress = btcAddress;
        settings.ethAddress = ethAddress;
        settings.updatedAt = new Date();
        await settings.save();

        res.json({ success: true, message: 'Adresses mises à jour', settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// RÉCUPÉRER LES ADRESSES CRYPTO
// ==========================================
router.get('/crypto-addresses', verifyAdmin, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;