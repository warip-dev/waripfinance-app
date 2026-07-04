const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getPendingUsers,
    getActiveUsers,
    validateUser,
    getUserDetails
} = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Routes protégées par authentification + admin
router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/users/pending', authenticate, isAdmin, getPendingUsers);
router.get('/users/active', authenticate, isAdmin, getActiveUsers);
router.get('/users/:id', authenticate, isAdmin, getUserDetails);
router.put('/users/:id/validate', authenticate, isAdmin, validateUser);

module.exports = router;