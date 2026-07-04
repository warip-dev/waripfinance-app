require('dotenv').config();
const express = require('express');
const path = require('path');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

// Chemin vers le frontend build (à la racine du projet)
const frontendPath = path.join(__dirname, '../frontend_build');

// Servir les fichiers statiques du frontend
app.use(express.static(frontendPath));

// Route API (garder les routes existantes)
// Les routes API sont déjà dans app.js

// Pour toutes les autres routes, servir index.html
app.get('*', (req, res) => {
  // Si c'est une requête API, ne pas interférer
  if (req.path.startsWith('/api')) {
    return;
  }
  // Sinon, servir le frontend
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Warip Finance API démarrée sur http://localhost:${PORT}`);
  console.log(`📱 Frontend servis depuis : ${frontendPath}`);
});