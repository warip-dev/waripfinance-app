require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, '../public');
console.log('📁 Dossier public :', publicPath);

if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
}

app.use(express.static(publicPath));

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

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Warip Finance API fonctionne !',
        timestamp: new Date()
    });
});

app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(publicPath, 'dashboard.html'));
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
        res.send('<h1>Admin Panel</h1>');
    }
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err);
    res.status(500).json({ success: false, message: 'Erreur interne' });
});

async function initDatabaseWithRetry() {
    try {
        const { initDatabase } = require('./config/database');
        await initDatabase();
        console.log('✅ Base de données initialisée');
    } catch (err) {
        console.error('❌ Erreur initialisation:', err.message);
    }
}

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