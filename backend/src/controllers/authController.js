const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ← Attention : 'user' en minuscule

const register = async (req, res) => {
    try {
        console.log('📝 Corps de la requête reçu:', req.body);

        const {
            email, password, first_name, last_name, phone, country,
            city, postal_code, street_name, street_number, profession,
            gender, marital_status
        } = req.body;

        // Vérification des champs obligatoires
        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                error: 'Champs obligatoires manquants (email, password, first_name, last_name)'
            });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Hacher le mot de passe
        const password_hash = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const user = await User.create({
            email,
            password_hash,
            first_name,
            last_name,
            phone: phone || '',
            country: country || 'FR',
            city: city || '',
            postal_code: postal_code || '',
            street_name: street_name || '',
            street_number: street_number || '',
            profession: profession || '',
            gender: gender || '',
            marital_status: marital_status || ''
        });

        res.status(201).json({
            message: '✅ Compte créé avec succès. En attente de validation.',
            user
        });

    } catch (error) {
        console.error('❌ ERREUR COMPLÈTE:', error);
        console.error('❌ MESSAGE:', error.message);
        console.error('❌ STACK:', error.stack);

        res.status(500).json({
            error: 'Erreur lors de l\'inscription',
            details: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            message: '✅ Connexion réussie',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                status: user.status,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json({ user });
    } catch (error) {
        console.error('❌ Erreur profil:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};

module.exports = { register, login, getProfile };