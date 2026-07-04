require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dossier public (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES API - Vérifiez que ces fichiers existent
try {
  const authRoutes = require('./src/routes/authRoutes');
  const userRoutes = require('./src/routes/userRoutes');
  const adminRoutes = require('./src/routes/adminRoutes');
  const transactionRoutes = require('./src/routes/transactionRoutes');

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/transactions', transactionRoutes);
} catch (error) {
  console.error('❌ Erreur d\'import des routes:', error.message);
}

// Route API de test
app.get('/api', (req, res) => {
  res.json({ message: '🚀 Warip Finance API', status: 'online' });
});

// TOUTES LES AUTRES ROUTES → Frontend
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log('📁 index.html path:', indexPath);
  res.sendFile(indexPath);
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
});

// Démarrer
app.listen(PORT, () => {
  console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
  console.log(`📁 Dossier public : ${path.join(__dirname, 'public')}`);
});