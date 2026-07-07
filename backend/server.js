require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

// ============================================
// CONNEXION À LA BASE DE DONNÉES
// ============================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'u120682741_waripfina_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u120682741_waripfinanc_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ============================================
// ROUTES
// ============================================

app.get('/api', (req, res) => {
    res.json({ message: '🚀 Warip Finance API en ligne', status: 'online' });
});

// ============================================
// INSCRIPTION
// ============================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, country } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }

        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, country, city, postal_code, street_name, street_number, profession, gender, marital_status, status, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, password_hash, first_name, last_name, '', country || 'FR', '', '', '', '', '', '', '', 'PENDING', 'USER']
        );

        res.status(201).json({
            message: '✅ Compte créé avec succès',
            user: { id: result.insertId, email, first_name, last_name, status: 'PENDING', role: 'USER' }
        });

    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// ============================================
// CONNEXION
// ============================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const [rows] = await pool.execute('SELECT id, email, password_hash, first_name, last_name, status, role FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        res.json({
            token: 'mock-token-' + Date.now(),
            user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, status: user.status, role: user.role }
        });

    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// ============================================
// ADMIN - LISTE DES UTILISATEURS
// ============================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, email, first_name, last_name, status, role, created_at FROM users ORDER BY created_at DESC');
        res.json({ users: rows });
    } catch (error) {
        console.error('❌ Erreur admin users:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// ADMIN - VALIDER UN UTILISATEUR
// ============================================
app.put('/api/admin/users/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: '✅ Utilisateur validé' });
    } catch (error) {
        console.error('❌ Erreur validation:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// MOT DE PASSE OUBLIÉ - MOCK
// ============================================
app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });
    res.json({ message: '✅ Un email de réinitialisation a été envoyé (MOCK)' });
});

app.post('/api/auth/reset-password', (req, res) => {
    res.json({ message: '✅ Mot de passe réinitialisé avec succès (MOCK)' });
});

// ============================================
// ROUTES STATIQUES
// ============================================
app.get('/confirmation.html', (req, res) => {
    res.sendFile(__dirname + '/public/confirmation.html');
});

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
});