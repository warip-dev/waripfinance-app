const pool = require('../config/database');

class User {
    // Créer un utilisateur
    static async create(userData) {
        const {
            email, password_hash, first_name, last_name, phone, country,
            city, postal_code, street_name, street_number, profession,
            gender, marital_status
        } = userData;

        const [result] = await pool.execute(
            `INSERT INTO users (
                email, password_hash, first_name, last_name, phone, country,
                city, postal_code, street_name, street_number, profession,
                gender, marital_status, status, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email, password_hash, first_name, last_name, phone, country,
                city, postal_code, street_name, street_number, profession,
                gender, marital_status, 'PENDING', 'USER'
            ]
        );

        const [rows] = await pool.execute(
            'SELECT id, email, first_name, last_name, status, role, created_at FROM users WHERE id = ?',
            [result.insertId]
        );
        return rows[0];
    }

    // Trouver un utilisateur par email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Trouver un utilisateur par ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT id, email, first_name, last_name, phone, country, 
                    city, postal_code, street_name, street_number, 
                    profession, gender, marital_status, 
                    btc_address, eth_address, status, role, admin_comment,
                    created_at, updated_at 
             FROM users WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Mettre à jour le statut d'un utilisateur (admin)
    static async updateStatus(id, status, adminComment = null) {
        await pool.execute(
            `UPDATE users 
             SET status = ?, 
                 admin_comment = COALESCE(?, admin_comment),
                 updated_at = NOW()
             WHERE id = ?`,
            [status, adminComment, id]
        );

        const [rows] = await pool.execute(
            'SELECT id, email, first_name, last_name, status, admin_comment, updated_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Récupérer tous les utilisateurs (admin)
    static async findAll(limit = 50, offset = 0) {
        const [rows] = await pool.execute(
            `SELECT id, email, first_name, last_name, phone, status, role, created_at 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );
        return rows;
    }

    // Récupérer les utilisateurs en attente (admin)
    static async findPending() {
        const [rows] = await pool.execute(
            `SELECT id, email, first_name, last_name, phone, created_at 
             FROM users 
             WHERE status = 'PENDING'
             ORDER BY created_at ASC`
        );
        return rows;
    }

    // Récupérer les utilisateurs actifs
    static async findActive() {
        const [rows] = await pool.execute(
            `SELECT id, email, first_name, last_name, phone, created_at 
             FROM users 
             WHERE status = 'ACTIVE'
             ORDER BY created_at DESC`
        );
        return rows;
    }

    // ============================================
    // MOT DE PASSE OUBLIÉ
    // ============================================
    static async findByEmailForReset(email) {
        const [rows] = await pool.execute(
            'SELECT id, email, first_name FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async saveResetToken(email, token, expiresAt) {
        await pool.execute(
            `UPDATE users 
             SET reset_token = ?, 
                 reset_token_expires = ? 
             WHERE email = ?`,
            [token, expiresAt, email]
        );
    }

    static async findByResetToken(token) {
        const [rows] = await pool.execute(
            `SELECT id, email, first_name 
             FROM users 
             WHERE reset_token = ? 
             AND reset_token_expires > NOW()`,
            [token]
        );
        return rows[0];
    }

    static async resetPassword(email, newPasswordHash) {
        await pool.execute(
            `UPDATE users 
             SET password_hash = ?, 
                 reset_token = NULL, 
                 reset_token_expires = NULL 
             WHERE email = ?`,
            [newPasswordHash, email]
        );
    }
}

module.exports = User;