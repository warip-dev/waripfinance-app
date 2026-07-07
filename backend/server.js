require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Dossier public (frontend)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Routes API
app.use('/api', app);

// Route de test API
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 Warip Finance API - Bienvenue !',
    status: 'online',
    version: '1.0.0'
  });
});

// Pour toutes les autres routes → index.html (React Router gère)
app.get('*', (req, res) => {
  // Ne pas interférer avec les routes API
  if (req.path.startsWith('/api')) {
    return;
  }
  // Servir le frontend React
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
  console.log(`📁 Frontend : ${publicPath}`);
});