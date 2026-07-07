const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getProfile,
    forgotPassword,
    verifyResetToken,
    resetPassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

// Routes mot de passe oublié
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);

module.exports = router;