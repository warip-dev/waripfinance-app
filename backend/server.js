require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes API (si vos fichiers existent)
try {
  const authRoutes = require('./src/routes/authRoutes');
  const adminRoutes = require('./src/routes/adminRoutes');
  const transactionRoutes = require('./src/routes/transactionRoutes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/transactions', transactionRoutes);
} catch (error) {
  console.error('❌ Erreur de chargement des routes:', error.message);
}

// Servir les fichiers HTML statiques depuis le dossier public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Route de test pour l'API
app.get('/api', (req, res) => {
  res.json({ message: '🚀 Warip Finance API en ligne', status: 'online' });
});

// Pour toutes les autres routes, servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur interne:', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
  console.log(`📁 Dossier public : ${publicPath}`);
});