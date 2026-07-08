const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

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

router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const allUsers = await User.findAll();
        const pendingUsers = await User.findPending();
        const pendingTransfers = await Transfer.countPending();
        const totalTransfers = await Transfer.countAll();

        res.json({
            success: true,
            stats: {
                totalUsers: allUsers.length,
                pendingUsers: pendingUsers.length,
                pendingTransfers: pendingTransfers,
                totalTransfers: totalTransfers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/pending-users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.findPending();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/validate-user/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        await User.update(req.params.id, { status: 'active' });

        res.json({ success: true, message: 'Compte validé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/reject-user/:id', verifyAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        await User.update(req.params.id, { status: 'rejected', rejectionReason: reason });

        res.json({ success: true, message: 'Compte rejeté' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/pending-transfers', verifyAdmin, async (req, res) => {
    try {
        const transfers = await Transfer.findPending();
        res.json({ success: true, transfers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/validate-transfer/:id', verifyAdmin, async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id);
        if (!transfer) {
            return res.status(404).json({ success: false, message: 'Virement non trouvé' });
        }

        await Transfer.updateStatus(req.params.id, 'confirmed');
        await User.updateBalance(transfer.userId, -transfer.amount, 'current');
        await User.addTransaction(
            transfer.userId,
            'transfer',
            transfer.amount,
            `Virement vers ${transfer.beneficiaryName} ${transfer.beneficiaryLastName}`,
            null,
            transfer.iban,
            'confirmed'
        );

        res.json({ success: true, message: 'Virement validé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/reject-transfer/:id', verifyAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const transfer = await Transfer.findById(req.params.id);
        if (!transfer) {
            return res.status(404).json({ success: false, message: 'Virement non trouvé' });
        }

        await Transfer.updateStatus(req.params.id, 'rejected', reason);

        res.json({ success: true, message: 'Virement rejeté' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/crypto-addresses', verifyAdmin, async (req, res) => {
    try {
        const { btcAddress, ethAddress } = req.body;
        await Settings.update({ btcAddress, ethAddress });

        res.json({ success: true, message: 'Adresses mises à jour' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/crypto-addresses', verifyAdmin, async (req, res) => {
    try {
        const settings = await Settings.get();
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;