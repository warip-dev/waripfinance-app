require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Dossier public (fichiers HTML)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// ============================================
// ROUTES API - VRAIES (avec base de données)
// ============================================

// Importer les vraies routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de test API
app.get('/api', (req, res) => {
    res.json({ message: '🚀 Warip Finance API en ligne', status: 'online' });
});

// Toutes les autres routes → index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
    console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
    console.log(`📁 Dossier public : ${publicPath}`);
});