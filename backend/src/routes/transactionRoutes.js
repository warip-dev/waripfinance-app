const express = require('express');
const router = express.Router();
const {
    createTransfer,
    getUserTransfers,
    getPendingTransfers,
    getAllTransfers,
    validateTransfer,
    getTransferDetails
} = require('../controllers/transactionController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/transfer', authenticate, createTransfer);
router.get('/transfers', authenticate, getUserTransfers);

router.get('/admin/transfers/pending', authenticate, isAdmin, getPendingTransfers);
router.get('/admin/transfers', authenticate, isAdmin, getAllTransfers);
router.get('/admin/transfers/:id', authenticate, isAdmin, getTransferDetails);
router.put('/admin/transfers/:id/validate', authenticate, isAdmin, validateTransfer);

module.exports = router;