const express = require('express');
const path = require('path');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

// Chemin absolu vers le dossier public_html (où sont les fichiers React)
const frontendPath = path.join(__dirname, '../public_html');

// Servir les fichiers statiques
app.use(express.static(frontendPath));

// Pour toutes les routes non-API, servir index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return; // Laisser l'API gérer
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Warip Finance API démarrée sur http://localhost:${PORT}`);
  console.log(`📱 Frontend servis depuis : ${frontendPath}`);
});