const { promisePool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    static async findAll() {
        const [rows] = await promisePool.execute(
            'SELECT * FROM users ORDER BY createdAt DESC'
        );
        return rows;
    }

    static async findPending() {
        const [rows] = await promisePool.execute(
            'SELECT * FROM users WHERE status = "pending" ORDER BY createdAt DESC'
        );
        return rows;
    }

    static async create(data) {
        const {
            firstName, lastName, email, password,
            phone, phoneCountry, streetNumber, streetName,
            city, postalCode, gender, maritalStatus,
            profession, country
        } = data;

        const hashedPassword = await bcrypt.hash(password, 10);
        const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        const currentIban = `FR76CUR${random}`;
        const savingsIban = `FR76SAV${random}`;

        const [result] = await promisePool.execute(`
            INSERT INTO users (
                firstName, lastName, email, password,
                phone, phoneCountry, streetNumber, streetName,
                city, postalCode, gender, maritalStatus,
                profession, country, currentIban, savingsIban
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            firstName, lastName, email, hashedPassword,
            phone, phoneCountry, streetNumber, streetName,
            city, postalCode, gender, maritalStatus,
            profession, country, currentIban, savingsIban
        ]);

        return result.insertId;
    }

    static async update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        values.push(id);

        await promisePool.execute(
            `UPDATE users SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );
    }

    static async comparePassword(user, password) {
        return await bcrypt.compare(password, user.password);
    }

    static async getTransactions(userId) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 10',
            [userId]
        );
        return rows;
    }

    static async addTransaction(userId, type, amount, description, from_account, to_account, status = 'pending') {
        const [result] = await promisePool.execute(`
            INSERT INTO transactions (userId, type, amount, description, from_account, to_account, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, type, amount, description, from_account, to_account, status]);
        return result.insertId;
    }

    static async updateBalance(userId, amount, accountType = 'current') {
        const field = accountType === 'current' ? 'currentBalance' : 'savingsBalance';
        await promisePool.execute(
            `UPDATE users SET ${field} = ${field} + ? WHERE id = ?`,
            [amount, userId]
        );
    }

    static isAdmin(user) {
        return user && user.role === 'admin';
    }
}

module.exports = User;