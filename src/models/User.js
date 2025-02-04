import bcrypt from 'bcrypt';
import pool from '../config/db.js';

class User {
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async create({ name, email, password, organizationId, role = 'admin' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [organizationId, name, email, hashedPassword, role]
    );
    
    return result.insertId;
  }

  static async validatePassword(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
  }
}

export default User;