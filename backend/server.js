require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// ROUTES
// ==========================================
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Route de test
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Warip Finance API fonctionne !',
        timestamp: new Date()
    });
});

// Redirection racine vers index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// CONNEXION MONGODB
// ==========================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waripfinance')
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// ==========================================
// DÉMARRAGE
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Serveur Warip Finance démarré sur http://localhost:${PORT}`);
});