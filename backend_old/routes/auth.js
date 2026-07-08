const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ==========================================
// INSCRIPTION COMPLÈTE
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { 
            firstName, lastName, email, password,
            phone, phoneCountry, streetNumber, streetName,
            city, postalCode, gender, maritalStatus,
            profession, country
        } = req.body;

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cet email est déjà utilisé' 
            });
        }

        const userId = await User.create({
            firstName, lastName, email, password,
            phone, phoneCountry, streetNumber, streetName,
            city, postalCode, gender, maritalStatus,
            profession, country
        });

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès, en attente de validation',
            userId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création du compte' 
        });
    }
});

// ==========================================
// CONNEXION
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        if (user.status === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Votre compte est en attente de validation par notre équipe'
            });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({
                success: false,
                message: 'Votre compte a été rejeté. Raison: ' + user.rejectionReason
            });
        }

        const isMatch = await User.comparePassword(user, password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const transactions = await User.getTransactions(user.id);

        res.json({
            success: true,
            message: 'Connexion réussie !',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accounts: {
                    current: { balance: parseFloat(user.currentBalance || 0), iban: user.currentIban },
                    savings: { balance: parseFloat(user.savingsBalance || 0), iban: user.savingsIban }
                },
                transactions: transactions,
                status: user.status,
                role: user.role,
                phone: user.phone,
                phoneCountry: user.phoneCountry,
                streetNumber: user.streetNumber,
                streetName: user.streetName,
                city: user.city,
                postalCode: user.postalCode,
                gender: user.gender,
                maritalStatus: user.maritalStatus,
                profession: user.profession,
                country: user.country
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
});

// ==========================================
// RÉCUPÉRER LE PROFIL UTILISATEUR
// ==========================================
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Non authentifié' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }

        const transactions = await User.getTransactions(user.id);

        res.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                phoneCountry: user.phoneCountry,
                streetNumber: user.streetNumber,
                streetName: user.streetName,
                city: user.city,
                postalCode: user.postalCode,
                gender: user.gender,
                maritalStatus: user.maritalStatus,
                profession: user.profession,
                country: user.country,
                accounts: {
                    current: { balance: parseFloat(user.currentBalance || 0), iban: user.currentIban },
                    savings: { balance: parseFloat(user.savingsBalance || 0), iban: user.savingsIban }
                },
                transactions: transactions,
                status: user.status,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(401).json({ 
            success: false, 
            message: 'Token invalide' 
        });
    }
});

// ==========================================
// CHANGER LE MOT DE PASSE
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email non trouvé'
            });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update(user.id, { password: hashedPassword });

        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de mot de passe'
        });
    }
});

module.exports = router;