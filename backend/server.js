require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// SERVEUR DES FICHIERS STATIQUES
// ==========================================
const publicPath = path.join(__dirname, 'public');
console.log('📁 Dossier public :', publicPath);

if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
}

app.use(express.static(publicPath));

// ==========================================
// ROUTES
// ==========================================
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const transferRoutes = require('./routes/transfer');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transfer', transferRoutes);

// ==========================================
// ROUTE DE TEST
// ==========================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Warip Finance API fonctionne !',
        timestamp: new Date()
    });
});

// ==========================================
// ROUTES PRINCIPALES
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(publicPath, 'register.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin', 'index.html'));
});

// ==========================================
// CONNEXION MONGODB
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waripfinance';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// ==========================================
// DÉMARRAGE
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Warip Finance démarré sur le port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🌐 Admin : http://localhost:${PORT}/admin`);
});