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
// MIDDLEWARE AUTH
// ============================================
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Non autorisé' });
    const token = authHeader.split(' ')[1];
    // Récupérer l'utilisateur depuis le token (simplifié)
    const [rows] = await pool.execute('SELECT id, role FROM users WHERE id = ?', [1]);
    if (rows.length === 0) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    req.userId = rows[0].id;
    req.userRole = rows[0].role;
    next();
}

// ============================================
// CRÉATION DES TABLES
// ============================================
(async () => {
    try {
        // Table users
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                phone VARCHAR(50),
                country VARCHAR(10),
                status ENUM('PENDING', 'ACTIVE', 'BLOCKED') DEFAULT 'PENDING',
                role ENUM('USER', 'ADMIN') DEFAULT 'USER',
                btc_address VARCHAR(255),
                eth_address VARCHAR(255),
                balance DECIMAL(15,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Table beneficiaries
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
        // Table transfers
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
        // Table deposit_addresses (une seule adresse par crypto)
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS deposit_addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                currency VARCHAR(10) NOT NULL UNIQUE,
                address VARCHAR(255) NOT NULL,
                network VARCHAR(50),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        // Insert default addresses (si elles n'existent pas)
        await pool.execute(`
            INSERT IGNORE INTO deposit_addresses (currency, address, network) VALUES 
            ('BTC', 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 'Bitcoin'),
            ('ETH', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'ERC20')
        `);
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
// ADMIN - UTILISATEURS
// ============================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, email, first_name, last_name, status, role, balance, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users: rows });
    } catch (error) {
        console.error('❌ Erreur admin users:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.put('/api/admin/users/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: '✅ Utilisateur validé' });
    } catch (error) {
        console.error('❌ Erreur validation:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.put('/api/admin/users/:id/balance', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        await pool.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, id]);
        res.json({ success: true, message: '✅ Solde mis à jour' });
    } catch (error) {
        console.error('❌ Erreur update balance:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// ADMIN - ADRESSES DE DÉPÔT (UNIQUES)
// ============================================
app.get('/api/admin/deposit-addresses', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM deposit_addresses');
        res.json({ addresses: rows });
    } catch (error) {
        console.error('❌ Erreur deposit addresses:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.put('/api/admin/deposit-addresses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { address } = req.body;
        await pool.execute('UPDATE deposit_addresses SET address = ? WHERE id = ?', [address, id]);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Erreur update deposit address:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// BÉNÉFICIAIRES (Utilisateur)
// ============================================
app.get('/api/beneficiaries', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM beneficiaries WHERE user_id = ? ORDER BY created_at DESC',
            [req.userId]
        );
        res.json({ beneficiaries: rows });
    } catch (error) {
        console.error('❌ Erreur GET beneficiaries:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.post('/api/beneficiaries', authenticate, async (req, res) => {
    try {
        const { name, iban, bic } = req.body;
        if (!name || !iban) {
            return res.status(400).json({ error: 'Nom et IBAN requis' });
        }
        const [result] = await pool.execute(
            'INSERT INTO beneficiaries (user_id, name, iban, bic, status) VALUES (?, ?, ?, ?, ?)',
            [req.userId, name, iban, bic || null, 'PENDING']
        );
        res.json({ success: true, id: result.insertId, message: 'Bénéficiaire ajouté en attente de validation' });
    } catch (error) {
        console.error('❌ Erreur POST beneficiaries:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// ============================================
// ADMIN - BÉNÉFICIAIRES
// ============================================
app.get('/api/admin/beneficiaries', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT b.*, u.email, u.first_name, u.last_name FROM beneficiaries b JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC'
        );
        res.json({ beneficiaries: rows });
    } catch (error) {
        console.error('❌ Erreur admin beneficiaries:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.put('/api/admin/beneficiaries/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;
        await pool.execute(
            'UPDATE beneficiaries SET status = ?, rejection_reason = ? WHERE id = ?',
            [status, rejection_reason || null, id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Erreur admin beneficiaries validate:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// VIREMENTS (Utilisateur)
// ============================================
app.post('/api/transfers', authenticate, async (req, res) => {
    try {
        const { beneficiary_id, amount, reference } = req.body;
        if (!beneficiary_id || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Montant invalide' });
        }
        const [benef] = await pool.execute(
            'SELECT id, name FROM beneficiaries WHERE id = ? AND user_id = ? AND status = "ACTIVE"',
            [beneficiary_id, req.userId]
        );
        if (benef.length === 0) {
            return res.status(400).json({ error: 'Bénéficiaire non trouvé ou non validé' });
        }
        // Vérifier le solde
        const [user] = await pool.execute('SELECT balance FROM users WHERE id = ?', [req.userId]);
        if (user[0].balance < amount) {
            return res.status(400).json({ error: 'Solde insuffisant' });
        }
        const [result] = await pool.execute(
            'INSERT INTO transfers (user_id, beneficiary_id, amount, reference, status) VALUES (?, ?, ?, ?, ?)',
            [req.userId, beneficiary_id, amount, reference || null, 'PENDING']
        );
        res.json({ success: true, id: result.insertId, message: 'Virement soumis, en attente de validation admin' });
    } catch (error) {
        console.error('❌ Erreur POST transfers:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

app.get('/api/transfers', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*, b.name as beneficiary_name 
             FROM transfers t 
             JOIN beneficiaries b ON t.beneficiary_id = b.id 
             WHERE t.user_id = ? 
             ORDER BY t.created_at DESC`,
            [req.userId]
        );
        res.json({ transfers: rows });
    } catch (error) {
        console.error('❌ Erreur GET transfers:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// ADMIN - VIREMENTS
// ============================================
app.get('/api/admin/transfers', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*, u.email, u.first_name, u.last_name, u.balance, b.name as beneficiary_name 
             FROM transfers t 
             JOIN users u ON t.user_id = u.id 
             JOIN beneficiaries b ON t.beneficiary_id = b.id 
             WHERE t.status = "PENDING"
             ORDER BY t.created_at ASC`
        );
        res.json({ transfers: rows });
    } catch (error) {
        console.error('❌ Erreur admin transfers:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.put('/api/admin/transfers/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_comment } = req.body;
        // Récupérer le virement
        const [transfer] = await pool.execute('SELECT user_id, amount FROM transfers WHERE id = ?', [id]);
        if (transfer.length === 0) return res.status(404).json({ error: 'Virement non trouvé' });
        // Si validé, débiter le solde
        if (status === 'COMPLETED') {
            await pool.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [transfer[0].amount, transfer[0].user_id]);
        }
        await pool.execute(
            'UPDATE transfers SET status = ?, admin_comment = ? WHERE id = ?',
            [status, admin_comment || null, id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Erreur admin transfers validate:', error);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

// ============================================
// ROUTES STATIQUES
// ============================================
app.get('/confirmation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
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