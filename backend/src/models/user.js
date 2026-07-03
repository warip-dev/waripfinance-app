const pool = require('../config/database');

class User {
  static async create(userData) {
    const {
      email, password_hash, first_name, last_name, phone, country,
      city, postal_code, street_name, street_number, profession,
      gender, marital_status
    } = userData;

    const result = await pool.query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, phone, country,
        city, postal_code, street_name, street_number, profession,
        gender, marital_status, status, role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, email, first_name, last_name, status, role, created_at`,
      [
        email, password_hash, first_name, last_name, phone, country,
        city, postal_code, street_name, street_number, profession,
        gender, marital_status, 'PENDING', 'USER'
      ]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // ... autres méthodes
}

module.exports = User;