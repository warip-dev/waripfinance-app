require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

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
const publicPath = path.join(__dirname, '../public');
console.log('📁 Dossier public :', publicPath);

// Créer le dossier public s'il n'existe pas
if (!fs.existsSync(publicPath)) {
    try {
        fs.mkdirSync(publicPath, { recursive: true });
        console.log('✅ Dossier public créé');
    } catch (err) {
        console.error('❌ Erreur création dossier public:', err);
    }
}

app.use(express.static(publicPath));

// ==========================================
// ROUTES
// ==========================================
try {
    const authRoutes = require('./routes/auth');
    const adminRoutes = require('./routes/admin');
    const transferRoutes = require('./routes/transfer');

    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/transfer', transferRoutes);
    console.log('✅ Routes chargées avec succès');
} catch (err) {
    console.error('❌ Erreur chargement routes:', err);
}

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
    try {
        const filePath = path.join(publicPath, 'dashboard.html');
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.send('<h1>Warip Finance</h1><p>Bienvenue sur Warip Finance</p>');
        }
    } catch (err) {
        res.send('<h1>Warip Finance</h1><p>Bienvenue sur Warip Finance</p>');
    }
});

app.get('/login', (req, res) => {
    try {
        res.sendFile(path.join(publicPath, 'login.html'));
    } catch (err) {
        res.redirect('/');
    }
});

app.get('/register', (req, res) => {
    try {
        res.sendFile(path.join(publicPath, 'register.html'));
    } catch (err) {
        res.redirect('/');
    }
});

app.get('/admin', (req, res) => {
    try {
        res.sendFile(path.join(publicPath, 'admin', 'index.html'));
    } catch (err) {
        res.send('<h1>Admin Panel</h1><p>Page d\'administration</p>');
    }
});

// ==========================================
// GESTION DES ERREURS
// ==========================================
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route non trouvée' 
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur' 
    });
});

// ==========================================
// INITIALISATION DE LA BASE DE DONNÉES
// ==========================================
async function initDatabaseWithRetry() {
    try {
        const { initDatabase } = require('./config/database');
        await initDatabase();
        console.log('✅ Base de données initialisée avec succès');
    } catch (err) {
        console.error('❌ Erreur initialisation:', err.message);
    }
}

// ==========================================
// DÉMARRAGE
// ==========================================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Warip Finance démarré sur le port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🌐 Admin : http://localhost:${PORT}/admin`);
    console.log(`📁 Dossier public : ${publicPath}`);
    
    initDatabaseWithRetry();
});

server.on('error', (err) => {
    console.error('❌ Erreur démarrage:', err);
});

process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    server.close(() => {
        console.log('✅ Serveur arrêté');
        process.exit(0);
    });
});

console.log('✅ Serveur prêt');