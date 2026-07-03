const Transaction = require('../models/Transaction');

const createTransfer = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, recipient_name, recipient_iban, recipient_bic, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }
    if (!recipient_name || !recipient_iban) {
      return res.status(400).json({ error: 'Nom et IBAN du bénéficiaire requis' });
    }

    const transfer = await Transaction.createTransfer(userId, {
      amount,
      recipient_name,
      recipient_iban,
      recipient_bic,
      reference
    });

    res.status(201).json({
      message: '✅ Virement enregistré, en attente de validation',
      transfer
    });

  } catch (error) {
    console.error('Erreur création virement:', error);
    res.status(500).json({ error: 'Erreur lors de la création du virement' });
  }
};

const getUserTransfers = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    const transfers = await Transaction.getUserTransfers(userId, limit, offset);
    res.json({ transfers });
  } catch (error) {
    console.error('Erreur récupération virements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
};

const getPendingTransfers = async (req, res) => {
  try {
    const pending = await Transaction.getPendingTransfers();
    res.json({ pending });
  } catch (error) {
    console.error('Erreur récupération virements en attente:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
};

const getAllTransfers = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const transfers = await Transaction.getAllTransfers(limit, offset);
    res.json({ transfers });
  } catch (error) {
    console.error('Erreur récupération tous les virements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
};

const validateTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_comment } = req.body;
    const adminId = req.userId;

    if (!['COMPLETED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const transfer = await Transaction.validateTransfer(id, adminId, status, admin_comment);
    if (!transfer) {
      return res.status(404).json({ error: 'Virement non trouvé' });
    }

    res.json({
      message: `✅ Virement ${status === 'COMPLETED' ? 'validé' : 'rejeté'}`,
      transfer
    });

  } catch (error) {
    console.error('Erreur validation virement:', error);
    res.status(500).json({ error: 'Erreur lors de la validation' });
  }
};

const getTransferDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const transfer = await Transaction.findById(id);
    if (!transfer) {
      return res.status(404).json({ error: 'Virement non trouvé' });
    }
    res.json({ transfer });
  } catch (error) {
    console.error('Erreur récupération détails:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
};

module.exports = {
  createTransfer,
  getUserTransfers,
  getPendingTransfers,
  getAllTransfers,
  validateTransfer,
  getTransferDetails
};