const express = require('express');
const path = require('path');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

// Chemin ABSOLU vers le dossier public_html
const frontendPath = path.join(__dirname, 'frontend');

// Servir les fichiers statiques
app.use(express.static(frontendPath));

// Pour toutes les routes non-API, servir index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return; // Laisser l'API gérer
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Warip Finance API démarrée sur http://localhost:${PORT}`);
  console.log(`📱 Frontend disponible à http://localhost:${PORT}`);
  console.log(`📁 Chemin du frontend : ${frontendPath}`);
});