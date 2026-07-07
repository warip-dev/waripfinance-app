require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Dossier public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Route de test
app.get('/api', (req, res) => {
    res.json({ message: 'API Warip Finance en ligne' });
});

// Routes API
try {
    const authRoutes = require('./src/routes/authRoutes');
    const adminRoutes = require('./src/routes/adminRoutes');
    const transactionRoutes = require('./src/routes/transactionRoutes');
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/transactions', transactionRoutes);
} catch (error) {
    console.log('⚠️ Routes API non chargées:', error.message);
}

// Toutes les autres routes → index.html
app.get('*', (req, res) => {
    try {
        res.sendFile(path.join(publicPath, 'index.html'));
    } catch (error) {
        res.status(500).send('Erreur serveur');
    }
});

// Démarrer
app.listen(PORT, () => {
    console.log(`🚀 Server démarré sur port ${PORT}`);
});