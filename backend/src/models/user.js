const pool = require('../config/database');

class User {
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

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, email, first_name, last_name, phone, country, 
              city, postal_code, street_name, street_number, 
              profession, gender, marital_status, 
              btc_address, eth_address, status, role, 
              created_at, updated_at 
       FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async updateStatus(id, status, btcAddress = null, ethAddress = null) {
    await pool.execute(
      `UPDATE users 
       SET status = ?, 
           btc_address = COALESCE(?, btc_address), 
           eth_address = COALESCE(?, eth_address)
       WHERE id = ?`,
      [status, btcAddress, ethAddress, id]
    );

    const [rows] = await pool.execute(
      'SELECT id, email, first_name, last_name, status, btc_address, eth_address FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll(limit = 50, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT id, email, first_name, last_name, phone, status, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async findPending() {
    const [rows] = await pool.execute(
      `SELECT id, email, first_name, last_name, phone, created_at 
       FROM users 
       WHERE status = 'PENDING'
       ORDER BY created_at ASC`
    );
    return rows;
  }
}

module.exports = User;