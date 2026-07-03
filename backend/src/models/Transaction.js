const pool = require('../config/database');

class Transaction {
  static async createTransfer(userId, data) {
    const {
      asset = 'EUR',
      amount,
      recipient_name,
      recipient_iban,
      recipient_bic,
      reference,
      sender_name
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO transactions (
        user_id, type, asset, amount, 
        sender_name, recipient_name, recipient_iban, recipient_bic, 
        reference, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'TRANSFER',
        asset,
        amount,
        sender_name || null,
        recipient_name,
        recipient_iban,
        recipient_bic || null,
        reference || null,
        'PENDING'
      ]
    );

    const [rows] = await pool.execute(
      'SELECT id, user_id, amount, recipient_name, status, created_at FROM transactions WHERE id = ?',
      [result.insertId]
    );
    return rows[0];
  }

  static async getUserTransfers(userId, limit = 50, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT id, amount, recipient_name, status, admin_comment, 
              created_at, validated_at
       FROM transactions 
       WHERE user_id = ? AND type = 'TRANSFER'
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async getPendingTransfers() {
    const [rows] = await pool.execute(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.type = 'TRANSFER' AND t.status = 'PENDING'
       ORDER BY t.created_at ASC`
    );
    return rows;
  }

  static async getAllTransfers(limit = 100, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.type = 'TRANSFER'
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async validateTransfer(transferId, adminId, status, adminComment = null) {
    await pool.execute(
      `UPDATE transactions 
       SET status = ?, 
           admin_comment = COALESCE(?, admin_comment),
           validated_by = ?,
           validated_at = NOW()
       WHERE id = ? AND type = 'TRANSFER'`,
      [status, adminComment, adminId, transferId]
    );

    const [rows] = await pool.execute(
      'SELECT id, user_id, amount, recipient_name, status, admin_comment FROM transactions WHERE id = ?',
      [transferId]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  }
}

module.exports = Transaction;