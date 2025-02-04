import pool from '../config/db.js';

class Organization {
  static async findByDomain(domain) {
    if (!domain) return null;
    
    const [rows] = await pool.query(
      'SELECT * FROM organizations WHERE domain = ?',
      [domain]
    );
    return rows[0];
  }

  static async create({ name, domain }) {
    const [result] = await pool.query(
      'INSERT INTO organizations (name, domain) VALUES (?, ?)',
      [name, domain || null]
    );
    return result.insertId;
  }
}

export default Organization;