require('dotenv').config();
const express = require('express');
const path = require('path');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../public_html')));

// Pour toutes les routes non-API, servir index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return; // Laisser l'API gérer
  }
  res.sendFile(path.join(__dirname, '../public_html/index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Warip Finance API démarrée sur http://localhost:${PORT}`);
});