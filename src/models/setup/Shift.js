import pool from '../../config/db.js';

class Shift {
  static async findAll(organizationId) {
    const [rows] = await pool.query(
      'SELECT * FROM shifts WHERE organization_id = ?',
      [organizationId]
    );
    return rows;
  }

  static async create({ name, startTime, endTime, workingDays, organizationId }) {
    const [result] = await pool.query(
      'INSERT INTO shifts (name, start_time, end_time, working_days, organization_id) VALUES (?, ?, ?, ?, ?)',
      [name, startTime, endTime, workingDays, organizationId]
    );
    return result.insertId;
  }

  static async update(id, { name, startTime, endTime, workingDays, organizationId }) {
    const [result] = await pool.query(
      'UPDATE shifts SET name = ?, start_time = ?, end_time = ?, working_days = ? WHERE id = ? AND organization_id = ?',
      [name, startTime, endTime, workingDays, id, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async delete(id, organizationId) {
    const [result] = await pool.query(
      'DELETE FROM shifts WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async findById(id, organizationId) {
    const [rows] = await pool.query(
      'SELECT * FROM shifts WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return rows[0];
  }

  static async assignToEmployee(employeeId, shiftId, startDate, endDate, organizationId) {
    // First verify the shift belongs to the organization
    const [shift] = await pool.query(
      'SELECT id FROM shifts WHERE id = ? AND organization_id = ?',
      [shiftId, organizationId]
    );
    
    if (!shift) {
      throw new Error('Shift not found in this organization');
    }

    const [result] = await pool.query(
      'INSERT INTO employee_shifts (employee_id, shift_id, start_date, end_date, organization_id) VALUES (?, ?, ?, ?, ?)',
      [employeeId, shiftId, startDate, endDate, organizationId]
    );
    return result.insertId;
  }

  static async getEmployeeShifts(employeeId, organizationId) {
    const [rows] = await pool.query(
      `SELECT s.*, es.start_date, es.end_date 
       FROM shifts s
       INNER JOIN employee_shifts es ON s.id = es.shift_id
       WHERE es.employee_id = ? AND s.organization_id = ?
       ORDER BY es.start_date DESC`,
      [employeeId, organizationId]
    );
    return rows;
  }

  static async verifyEmployeeExists(employeeId, organizationId) {
    const [rows] = await pool.query(
      'SELECT id FROM employees WHERE id = ? AND organization_id = ?',
      [employeeId, organizationId]
    );
    return rows.length > 0;
  }

  static async removeAssignment(id, organizationId) {
    const [assignment] = await pool.query(
      `SELECT es.* FROM employee_shifts es
       INNER JOIN employees e ON es.employee_id = e.id
       WHERE es.id = ? AND e.organization_id = ?`,
      [id, organizationId]
    );

    if (!assignment) {
      return false;
    }

    const [result] = await pool.query(
      'DELETE FROM employee_shifts WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

export default Shift; 