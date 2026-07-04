require('dotenv').config();
const express = require('express');
const path = require('path');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

// Chemin absolu vers le dossier frontend_build
const frontendPath = path.join(__dirname, '..', 'frontend_build');
console.log('📁 Chemin du frontend :', frontendPath);

// Servir les fichiers statiques du frontend
app.use(express.static(frontendPath));

// Pour toutes les routes non-API, servir index.html
app.get('*', (req, res) => {
  // Si l'URL commence par /api, on laisse l'API gérer
  if (req.path.startsWith('/api')) {
    return; // L'API est déjà gérée par les routes dans app.js
  }
  // Sinon, servir le frontend React
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Warip Finance API démarrée sur http://localhost:${PORT}`);
  console.log(`📱 Frontend servis depuis : ${frontendPath}`);
});