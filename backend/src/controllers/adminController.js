const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const users = await User.findAll(limit, offset);
    res.json({ users });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findPending();
    res.json({ users });
  } catch (error) {
    console.error('Erreur récupération utilisateurs en attente:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
};

const validateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { btc_address, eth_address } = req.body;

    const user = await User.updateStatus(id, 'ACTIVE', btc_address, eth_address);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      message: '✅ Utilisateur validé avec succès',
      user
    });

  } catch (error) {
    console.error('Erreur validation utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la validation' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Erreur récupération détails:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
};

module.exports = {
  getAllUsers,
  getPendingUsers,
  validateUser,
  getUserDetails
};