import pool from '../config/db.js';

class Organization {
  static async findByMobile(mobile) {
    if (!mobile) return null;
    
    const [rows] = await pool.query(
      'SELECT * FROM organizations WHERE mobile = ?',
      [mobile]
    );
    return rows[0];
  }

  static async create({ name, mobile }) {
    const [result] = await pool.query(
      'INSERT INTO organizations (name, mobile) VALUES (?, ?)',
      [name, mobile || null]
    );
    return result.insertId;
  }
}

export default Organization;