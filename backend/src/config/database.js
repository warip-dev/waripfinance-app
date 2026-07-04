const mysql = require('mysql2/promise');

// Créer le pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'waripfinance',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tester la connexion
pool.getConnection()
    .then(connection => {
        console.log('✅ Connecté à MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erreur de connexion MySQL:', err.message);
    });

module.exports = pool;