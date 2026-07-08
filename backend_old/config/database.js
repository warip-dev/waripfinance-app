const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'u120682741_waripfina_user',
    password: process.env.DB_PASSWORD || 'Gta@290499',
    database: process.env.DB_NAME || 'u120682741_waripfinanc_db',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 10000
});

const promisePool = pool.promise();

async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Connexion MySQL établie avec succès');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion MySQL:', error.message);
        return false;
    }
}

async function initDatabase() {
    try {
        const connected = await testConnection();
        if (!connected) {
            console.log('⚠️ Impossible de se connecter à MySQL');
            return;
        }

        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstName VARCHAR(100) NOT NULL,
                lastName VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                phoneCountry VARCHAR(10) NOT NULL,
                streetNumber VARCHAR(20) NOT NULL,
                streetName VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                postalCode VARCHAR(20) NOT NULL,
                gender ENUM('Homme', 'Femme', 'Autre') NOT NULL,
                maritalStatus ENUM('Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve') NOT NULL,
                profession VARCHAR(255) NOT NULL,
                country VARCHAR(100) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                status ENUM('pending', 'active', 'rejected') DEFAULT 'pending',
                rejectionReason TEXT DEFAULT '',
                currentBalance DECIMAL(15,2) DEFAULT 0,
                savingsBalance DECIMAL(15,2) DEFAULT 0,
                currentIban VARCHAR(34) UNIQUE,
                savingsIban VARCHAR(34) UNIQUE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table users créée/vérifiée');

        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS transfers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                beneficiaryName VARCHAR(100) NOT NULL,
                beneficiaryLastName VARCHAR(100) NOT NULL,
                iban VARCHAR(34) NOT NULL,
                bic VARCHAR(20) NOT NULL,
                reference VARCHAR(255),
                amount DECIMAL(15,2) NOT NULL,
                status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
                rejectionReason TEXT DEFAULT '',
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table transfers créée/vérifiée');

        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                btcAddress VARCHAR(255) DEFAULT '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                ethAddress VARCHAR(255) DEFAULT '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                supportEmail VARCHAR(255) DEFAULT 'support@waripfinance.com',
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table settings créée/vérifiée');

        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                type ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'interest') NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                description VARCHAR(255),
                from_account VARCHAR(34),
                to_account VARCHAR(34),
                status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
                rejectionReason TEXT DEFAULT '',
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table transactions créée/vérifiée');

        const [admins] = await promisePool.execute(
            'SELECT * FROM users WHERE role = "admin" LIMIT 1'
        );
        
        if (admins.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('Admin123!', 10);
            await promisePool.execute(`
                INSERT INTO users 
                (firstName, lastName, email, password, phone, phoneCountry, 
                 streetNumber, streetName, city, postalCode, gender, 
                 maritalStatus, profession, country, role, status)
                VALUES 
                ('Admin', 'Warip', 'admin@waripfinance.com', ?, 
                 '+33123456789', '+33', '1', 'Rue Admin', 'Paris', '75001',
                 'Homme', 'Célibataire', 'Administrateur', 'France', 'admin', 'active')
            `, [hashedPassword]);
            console.log('✅ Admin créé par défaut');
            console.log('   📧 Email: admin@waripfinance.com');
            console.log('   🔑 Mot de passe: Admin123!');
        }

        console.log('✅ Base de données MySQL initialisée avec succès');

    } catch (error) {
        console.error('❌ Erreur initialisation:', error.message);
    }
}

module.exports = { promisePool, initDatabase };