const { promisePool } = require('../config/database');

class Transfer {
    static async create(data) {
        const {
            userId, beneficiaryName, beneficiaryLastName,
            iban, bic, reference, amount
        } = data;

        const [result] = await promisePool.execute(`
            INSERT INTO transfers (userId, beneficiaryName, beneficiaryLastName, iban, bic, reference, amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, beneficiaryName, beneficiaryLastName, iban, bic, reference, amount]);

        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM transfers WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    static async findByUser(userId) {
        const [rows] = await promisePool.execute(
            'SELECT * FROM transfers WHERE userId = ? ORDER BY date DESC',
            [userId]
        );
        return rows;
    }

    static async findPending() {
        const [rows] = await promisePool.execute(`
            SELECT t.*, u.firstName, u.lastName, u.email 
            FROM transfers t 
            JOIN users u ON t.userId = u.id 
            WHERE t.status = 'pending' 
            ORDER BY t.date DESC
        `);
        return rows;
    }

    static async updateStatus(id, status, rejectionReason = '') {
        await promisePool.execute(
            'UPDATE transfers SET status = ?, rejectionReason = ? WHERE id = ?',
            [status, rejectionReason, id]
        );
    }

    static async countPending() {
        const [rows] = await promisePool.execute(
            'SELECT COUNT(*) as count FROM transfers WHERE status = "pending"'
        );
        return rows[0].count;
    }

    static async countAll() {
        const [rows] = await promisePool.execute(
            'SELECT COUNT(*) as count FROM transfers'
        );
        return rows[0].count;
    }
}

module.exports = Transfer;