import pool from '../../config/db.js';
class Holiday {

  static async getHolidays(organizationId) {
    const [rows] = await pool.query(
      `SELECT * FROM holidays 
       WHERE organization_id = ? 
       ORDER BY date ASC`,
      [organizationId]
    );
    return rows;
  }

  static async getHolidayById(id, organizationId) {
    const [rows] = await pool.query(
      `SELECT * FROM holidays 
       WHERE id = ? AND organization_id = ?`,
      [id, organizationId]
    );
    return rows[0];
  }

  static async createHoliday({
    organizationId,
    name,
    description,
    date,
    type = 'full',
    status = 'active'
  }) {
    const [result] = await pool.query(
      `INSERT INTO holidays (
        organization_id, name, description, date, type, status
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [organizationId, name, description, date, type, status]
    );
    return result.insertId;
  }

  static async updateHoliday(id, {
    name,
    description,
    date,
    type,
    status,
    organizationId
  }) {
    const [result] = await pool.query(
      `UPDATE holidays 
       SET name = ?, description = ?, date = ?, 
           type = ?, status = ?
       WHERE id = ? AND organization_id = ?`,
      [name, description, date, type, status, id, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async deleteHoliday(id, organizationId) {
    const [result] = await pool.query(
      'DELETE FROM holidays WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return result.affectedRows > 0;
  }
}

export default Holiday;