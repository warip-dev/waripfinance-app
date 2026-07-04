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

// ROUTES API
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Route de test API
app.get('/api', (req, res) => {
  res.json({ message: '🚀 Warip Finance API', status: 'online' });
});

// TOUTES LES AUTRES ROUTES → Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
});