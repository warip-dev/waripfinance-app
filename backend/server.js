require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

// ============================================
// CONNEXION À LA BASE DE DONNÉES
// ============================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'u120682741_waripfina_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u120682741_waripfinanc_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ============================================
// CRÉATION DES TABLES (simplifié)
// ============================================
(async () => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                phone VARCHAR(50),
                country VARCHAR(10),
                city VARCHAR(100),
                postal_code VARCHAR(20),
                street_name VARCHAR(200),
                street_number VARCHAR(20),
                profession VARCHAR(100),
                gender VARCHAR(20),
                marital_status VARCHAR(20),
                status ENUM('PENDING', 'ACTIVE', 'BLOCKED') DEFAULT 'PENDING',
                role ENUM('USER', 'ADMIN') DEFAULT 'USER',
                balance DECIMAL(15,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS beneficiaries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                iban VARCHAR(50) NOT NULL,
                bic VARCHAR(20),
                status ENUM('PENDING', 'ACTIVE', 'REJECTED') DEFAULT 'PENDING',
                rejection_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS transfers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                beneficiary_id INT NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                reference VARCHAR(100),
                status ENUM('PENDING', 'COMPLETED', 'REJECTED') DEFAULT 'PENDING',
                admin_comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS deposit_addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                currency VARCHAR(10) NOT NULL UNIQUE,
                address VARCHAR(255) NOT NULL,
                network VARCHAR(50),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await pool.execute(`
            INSERT IGNORE INTO deposit_addresses (currency, address, network) VALUES 
            ('BTC', 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 'Bitcoin'),
            ('ETH', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'ERC20')
        `);

        const [adminExists] = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@waripfinance.com']);
        if (adminExists.length === 0) {
            const adminHash = await bcrypt.hash('Admin123!', 10);
            await pool.execute(
                `INSERT INTO users (email, password_hash, first_name, last_name, phone, country, status, role)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['admin@waripfinance.com', adminHash, 'Admin', 'Warip', '+33123456789', 'FR', 'ACTIVE', 'ADMIN']
            );
        }
        console.log('✅ Toutes les tables sont prêtes');
    } catch (error) {
        console.error('❌ Erreur création tables:', error);
    }
})();

// ============================================
// ROUTES AUTH
// ============================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, country } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, country, status, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, password_hash, first_name, last_name, '', country || 'FR', 'PENDING', 'USER']
        );
        res.status(201).json({
            success: true,
            message: '✅ Compte créé avec succès',
            user: { id: result.insertId, email, first_name, last_name, status: 'PENDING', role: 'USER' }
        });
    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }
        const [rows] = await pool.execute(
            'SELECT id, email, password_hash, first_name, last_name, status, role, balance FROM users WHERE email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        if (user.status === 'PENDING') {
            return res.status(403).json({ error: 'Votre compte est en attente de validation.', status: 'PENDING' });
        }
        if (user.status === 'BLOCKED') {
            return res.status(403).json({ error: 'Votre compte a été bloqué.', status: 'BLOCKED' });
        }
        res.json({
            success: true,
            token: 'token-' + Date.now(),
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                status: user.status,
                role: user.role,
                balance: user.balance
            }
        });
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, email, first_name, last_name, status, role, balance, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.put('/api/admin/users/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.get('/api/admin/deposit-addresses', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM deposit_addresses');
        res.json({ addresses: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// BENEFICIARIES & TRANSFERS (simplifiés)
// ============================================
app.get('/api/beneficiaries', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM beneficiaries');
        res.json({ beneficiaries: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.post('/api/beneficiaries', async (req, res) => {
    try {
        const { name, iban, bic } = req.body;
        if (!name || !iban) return res.status(400).json({ error: 'Nom et IBAN requis' });
        await pool.execute(
            'INSERT INTO beneficiaries (user_id, name, iban, bic, status) VALUES (?, ?, ?, ?, ?)',
            [1, name, iban, bic || null, 'PENDING']
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.get('/api/transfers', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*, b.name as beneficiary_name 
             FROM transfers t 
             JOIN beneficiaries b ON t.beneficiary_id = b.id`
        );
        res.json({ transfers: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.post('/api/transfers', async (req, res) => {
    try {
        const { beneficiary_id, amount, reference } = req.body;
        if (!beneficiary_id || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Montant invalide' });
        }
        const [result] = await pool.execute(
            'INSERT INTO transfers (user_id, beneficiary_id, amount, reference, status) VALUES (?, ?, ?, ?, ?)',
            [1, beneficiary_id, amount, reference || null, 'PENDING']
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// ROUTES STATIQUES
// ============================================
app.get('/confirmation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

app.get('/pending.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pending.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Warip Finance démarrée sur http://localhost:${PORT}`);
});