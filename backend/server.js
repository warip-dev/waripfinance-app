require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../public_html')));

// ROUTES API
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de test de l'API
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 Warip Finance API - Bienvenue !',
    status: 'online',
    version: '1.0.0'
  });
});

// POUR TOUTES LES AUTRES ROUTES (frontend React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html/index.html'));
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Warip Finance API démarrée sur http://localhost:${PORT}`);
  console.log(`📱 Frontend disponible à http://localhost:${PORT}`);
});