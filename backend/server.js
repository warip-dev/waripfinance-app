require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend (depuis le dossier public)
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES API
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de test API
app.get('/api', (req, res) => {
  res.json({ message: '🚀 Warip Finance API - Bienvenue !', status: 'online' });
});

// TOUTES LES AUTRES ROUTES → INDEX.HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
  console.log(`📁 Frontend : ${path.join(__dirname, 'public')}`);
});