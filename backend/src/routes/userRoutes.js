const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Routes utilisateur (à compléter)
router.get('/dashboard', authenticate, (req, res) => {
  res.json({ message: 'Tableau de bord utilisateur' });
});

module.exports = router;