const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getPendingUsers,
    validateUser,
    getUserDetails
} = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/users/pending', authenticate, isAdmin, getPendingUsers);
router.get('/users/:id', authenticate, isAdmin, getUserDetails);
router.put('/users/:id/validate', authenticate, isAdmin, validateUser);

module.exports = router;