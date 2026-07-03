const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Warip Bank API - Bienvenue !',
        status: 'online',
        version: '1.0.0'
    });
});

// Route 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Gestionnaire d'erreurs
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.stack);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

module.exports = app;