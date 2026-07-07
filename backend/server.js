const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

// ============================================
// ROUTES API
// ============================================

app.get('/api', (req, res) => {
    res.json({ message: '🚀 Warip Finance API en ligne', status: 'online' });
});

// ============================================
// INSCRIPTION - VRAIE
// ============================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, country } = req.body;

        console.log('📝 Données reçues:', { first_name, last_name, email, country });

        // Validation
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }

        // Simuler la création d'un compte (en attendant la base de données)
        const newUser = {
            id: Date.now(),
            email,
            first_name,
            last_name,
            status: 'PENDING',
            role: 'USER',
            created_at: new Date().toISOString()
        };

        console.log('✅ Compte créé (MOCK):', newUser);

        res.status(201).json({
            message: '✅ Compte créé avec succès. En attente de validation.',
            user: newUser
        });

    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// ============================================
// CONNEXION - MOCK
// ============================================
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

// ============================================
// ADMIN USERS - MOCK
// ============================================
app.get('/api/admin/users', (req, res) => {
    res.json({
        users: [
            { id: 1, email: 'admin@waripfinance.com', first_name: 'Admin', last_name: 'Warip', status: 'ACTIVE', role: 'ADMIN', created_at: new Date().toISOString() }
        ]
    });
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
// TOUTES LES AUTRES ROUTES → index.html
// ============================================
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
});