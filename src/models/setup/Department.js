import pool from '../../config/db.js';

class Department {
  static async findByOrganization(organizationId) {
    const [rows] = await pool.query(
      'SELECT * FROM departments WHERE organization_id = ?',
      [organizationId]
    );
    return rows;
  }
  static async findById({organizationId,id}) {
    const [rows] = await pool.query(
      'SELECT * FROM departments WHERE organization_id = ? and id = ?',
      [organizationId,id]
    );
    return rows;
  }
  

  static async create({ name, organizationId }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO departments (name, organization_id) VALUES (?, ?)',
        [name, organizationId]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Department name already exists in this organization');
      }
      throw error;
    }
  }

  static async update(id, { name, organizationId }) {
    const [result] = await pool.query(
      'UPDATE departments SET name = ? WHERE id = ? AND organization_id = ?',
      [name, id, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async delete(id, organizationId) {
    const [result] = await pool.query(
      'DELETE FROM departments WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async findByIdAndOrganization(id, organizationId) {
    const [rows] = await pool.query(
      'SELECT * FROM departments WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return rows[0];
  }

  static async hasDesignations(id, organizationId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM designations WHERE department_id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return rows[0].count > 0;
  }
}

export default Department; 