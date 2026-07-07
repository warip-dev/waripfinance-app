const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Servir les fichiers du dossier 'public'
app.use(express.static('public'));

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});