const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ==========================================
// INSCRIPTION
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cet email est déjà utilisé' 
            });
        }

        // Créer l'utilisateur
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone
        });

        await user.save();

        // Générer le token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès !',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accounts: user.accounts
            }
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

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Générer le token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Connexion réussie !',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accounts: user.accounts,
                transactions: user.transactions.slice(-5) // 5 dernières transactions
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
// RÉCUPÉRER LES DONNÉES UTILISATEUR
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

        res.json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                accounts: user.accounts,
                transactions: user.transactions.slice(-10)
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

module.exports = router;