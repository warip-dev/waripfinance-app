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

    const result = await pool.query(
      `INSERT INTO transactions (
        user_id, type, asset, amount, 
        sender_name, recipient_name, recipient_iban, recipient_bic, 
        reference, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, user_id, amount, recipient_name, status, created_at`,
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
    return result.rows[0];
  }

  static async getUserTransfers(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT id, amount, recipient_name, status, admin_comment, 
              created_at, validated_at
       FROM transactions 
       WHERE user_id = $1 AND type = 'TRANSFER'
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getPendingTransfers() {
    const result = await pool.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.type = 'TRANSFER' AND t.status = 'PENDING'
       ORDER BY t.created_at ASC`
    );
    return result.rows;
  }

  static async getAllTransfers(limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.type = 'TRANSFER'
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async validateTransfer(transferId, adminId, status, adminComment = null) {
    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1, 
           admin_comment = COALESCE($2, admin_comment),
           validated_by = $3,
           validated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND type = 'TRANSFER'
       RETURNING id, user_id, amount, recipient_name, status, admin_comment`,
      [status, adminComment, adminId, transferId]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT t.*, u.email, u.first_name, u.last_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Transaction;