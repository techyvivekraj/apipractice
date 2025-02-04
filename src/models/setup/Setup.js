import pool from '../../config/db.js';

class Setup {
  static async getSetupStatus(organizationId) {
    const [results] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM departments WHERE organization_id = ?) as department_count,
        (SELECT COUNT(*) FROM designations WHERE organization_id = ?) as designation_count,
        (SELECT COUNT(*) FROM shifts) as shift_count,
        (SELECT COUNT(*) FROM users 
         WHERE organization_id = ? AND role IN ('hr', 'manager')) as key_users_count
    `, [organizationId, organizationId, organizationId]);

    return {
      departments: {
        count: results[0].department_count,
        isComplete: results[0].department_count > 0
      },
      designations: {
        count: results[0].designation_count,
        isComplete: results[0].designation_count > 0
      },
      shifts: {
        count: results[0].shift_count,
        isComplete: results[0].shift_count > 0
      },
      keyUsers: {
        count: results[0].key_users_count,
        isComplete: results[0].key_users_count > 0
      }
    };
  }

  static async getKeyUsers(organizationId) {
    const [rows] = await pool.query(
      `SELECT id, name, email, role 
       FROM users 
       WHERE organization_id = ? AND role IN ('hr', 'manager')`,
      [organizationId]
    );
    return rows;
  }

  static async isSetupComplete(organizationId) {
    const status = await this.getSetupStatus(organizationId);
    return Object.values(status).every(step => step.isComplete);
  }
  
}

export default Setup; 