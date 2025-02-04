import pool from '../../config/db.js';

class Designation {
  static async findByOrganization(organizationId) {
    const [rows] = await pool.query(
      `SELECT d.*, dept.name as department_name 
       FROM designations d 
       LEFT JOIN departments dept ON d.department_id = dept.id 
       WHERE d.organization_id = ?`,
      [organizationId]
    );
    return rows;
  }

  static async create({ name, organizationId, departmentId }) {
    const [result] = await pool.query(
      'INSERT INTO designations (name, organization_id, department_id) VALUES (?, ?, ?)',
      [name, organizationId, departmentId]
    );
    return result.insertId;
  }

  static async update({ name, departmentId,organizationId }) {
    const [result] = await pool.query(
      'UPDATE designations SET name = ?, department_id = ? WHERE organization_id = ?',
      [name, departmentId, organizationId]
    );
    return result.affectedRows > 0;
  }

  static async delete({id,organizationId}) {
    // Check if designation is assigned to any employees
    const [employees] = await pool.query(
        'SELECT COUNT(*) as count FROM employees WHERE designation_id = ? and organization_id=?',
        [id,organizationId]
    );

    if (employees[0].count > 0) {
        // Return false indicating the designation cannot be deleted
        return {
            success: false,
            statusCode: 409,
            error: 'Cannot delete designation assigned to employees'
        };
    }

    // Proceed with deletion if no employees are assigned
    const [result] = await pool.query(
        'DELETE FROM designations WHERE id = ? and organization_id=?',
        [id,organizationId]
    );

    return { success: result.affectedRows > 0 };
}


  static async findByDepartment(departmentId, organizationId) {
    const [rows] = await pool.query(
      'SELECT * FROM designations WHERE department_id = ? AND organization_id = ?',
      [departmentId, organizationId]
    );
    return rows;
  }

  static async findByIdWithDepartment(id, organizationId) {
    const [rows] = await pool.query(
      `SELECT d.*, dept.name as department_name 
       FROM designations d
       LEFT JOIN departments dept ON d.department_id = dept.id
       WHERE d.id = ? AND d.organization_id = ?`,
      [id, organizationId]
    );
    return rows[0];
  }
}

export default Designation; 