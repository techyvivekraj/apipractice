import pool from '../../config/db.js';

class Asset {
  static async findAll(organizationId) {
    const [rows] = await pool.query(
      `SELECT a.*, e.first_name, e.last_name 
       FROM assets a 
       LEFT JOIN employees e ON a.assigned_to = e.id 
       WHERE a.organization_id = ?`,
      [organizationId]
    );
    return rows;
  }

  static async findById(id, organizationId) {
    const [rows] = await pool.query(
      `SELECT a.*, e.first_name, e.last_name 
       FROM assets a 
       LEFT JOIN employees e ON a.assigned_to = e.id 
       WHERE a.id = ? AND a.organization_id = ?`,
      [id, organizationId]
    );
    return rows[0];
  }

  static async create({ assetName, assignedTo, purchaseDate, condition, status, organizationId }) {
    const [result] = await pool.query(
      'INSERT INTO assets (asset_name, assigned_to, purchase_date, conditionn, status, organization_id) VALUES (?, ?, ?, ?, ?, ?)',
      [assetName, assignedTo, purchaseDate, condition, status, organizationId]
    );
    return result.insertId;
  }

  static async update(id, { assetName, assignedTo, purchaseDate, condition, status, organizationId }) {
    const [result] = await pool.query(
      'UPDATE assets SET asset_name = ?, assigned_to = ?, purchase_date = ?, conditionn = ?, status = ? WHERE id = ? AND organization_id = ?',
      [assetName, assignedTo, purchaseDate, condition, status, id, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async delete(id, organizationId) {
    const [result] = await pool.query(
      'DELETE FROM assets WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async getEmployeeAssets(employeeId, organizationId) {
    const [rows] = await pool.query(
      `SELECT * FROM assets 
       WHERE assigned_to = ? AND organization_id = ?`,
      [employeeId, organizationId]
    );
    return rows;
  }
}

export default Asset; 