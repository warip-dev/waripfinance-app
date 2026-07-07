const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

// ============================================
// ROUTES API (MOCK) - QUI FONCTIONNENT
// ============================================

app.get('/api', (req, res) => {
    res.json({ message: '🚀 Warip Finance API en ligne', status: 'online' });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@waripfinance.com' && password === 'Admin123!') {
        return res.json({
            token: 'mock-token-12345',
            user: { id: 1, email, first_name: 'Admin', last_name: 'Warip', role: 'ADMIN', status: 'ACTIVE' }
        });
    }
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { email, first_name, last_name } = req.body;
    if (!email || !first_name || !last_name) {
        return res.status(400).json({ error: 'Champs manquants' });
    }
    res.status(201).json({
        message: '✅ Compte créé avec succès (MOCK)',
        user: { id: 2, email, first_name, last_name, status: 'PENDING', role: 'USER' }
    });
});

// Admin users
app.get('/api/admin/users', (req, res) => {
    res.json({
        users: [
            { id: 1, email: 'admin@waripfinance.com', first_name: 'Admin', last_name: 'Warip', status: 'ACTIVE', role: 'ADMIN', created_at: new Date().toISOString() },
            { id: 2, email: 'user@test.com', first_name: 'Jean', last_name: 'Dupont', status: 'PENDING', role: 'USER', created_at: new Date().toISOString() }
        ]
    });
});

// Validate user
app.put('/api/admin/users/:id/validate', (req, res) => {
    res.json({ message: '✅ Utilisateur validé (MOCK)', user: { id: req.params.id, status: 'ACTIVE' } });
});

// Mot de passe oublié
app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });
    res.json({ message: '✅ Un email de réinitialisation a été envoyé (MOCK)' });
});

// Réinitialisation
app.post('/api/auth/reset-password', (req, res) => {
    res.json({ message: '✅ Mot de passe réinitialisé avec succès (MOCK)' });
});

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
});