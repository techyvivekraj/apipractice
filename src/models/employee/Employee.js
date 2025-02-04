import pool from '../../config/db.js';

class Employee {
  static async findByOrganization(organizationId) {
    const [rows] = await pool.query(
      `SELECT e.*, 
        d.name as department_name, 
        des.name as designation_name,
        rm.name as reporting_manager_name,
        pm.name as project_manager_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN employees rm ON e.reporting_manager_id = rm.id
       LEFT JOIN employees pm ON e.project_manager_id = pm.id
       WHERE e.organization_id = ?`,
      [organizationId]
    );
    return rows;
  }

  static async findById(id, organizationId) {
    const [rows] = await pool.query(
      `SELECT e.*, 
        d.name as department_name, 
        des.name as designation_name,
        rm.name as reporting_manager_name,
        pm.name as project_manager_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN employees rm ON e.reporting_manager_id = rm.id
       LEFT JOIN employees pm ON e.project_manager_id = pm.id
       WHERE e.id = ? AND e.organization_id = ?`,
      [id, organizationId]
    );
    return rows[0];
  }

  static async create({
    organizationId,
    employeeCode,
    firstName,
    middleName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    city,
    state,
    country,
    postalCode,
    emergencyContactName,
    emergencyContactPhone,
    departmentId,
    designationId,
    joiningDate,
    salaryType,
    bankAccountNumber,
    bankIfscCode,
    reportingManagerId,
    projectManagerId
  }) {
    const [result] = await pool.query(
      `INSERT INTO employees (
        organization_id, employee_code, first_name, middle_name, last_name,
        email, phone, date_of_birth, gender, blood_group,
        address, city, state, country, postal_code,
        emergency_contact_name, emergency_contact_phone,
        department_id, designation_id, joining_date,
        salary_type, bank_account_number, bank_ifsc_code,
        reporting_manager_id, project_manager_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizationId, employeeCode, firstName, middleName, lastName,
        email, phone, dateOfBirth, gender, bloodGroup,
        address, city, state, country, postalCode,
        emergencyContactName, emergencyContactPhone,
        departmentId, designationId, joiningDate,
        salaryType, bankAccountNumber, bankIfscCode,
        reportingManagerId, projectManagerId
      ]
    );
    return result.insertId;
  }

  static async update(id, {
    departmentId,
    designationId,
    salaryType,
    bankAccountNumber,
    bankIfscCode,
    reportingManagerId,
    projectManagerId,
    status,
    organizationId
  }) {
    const [result] = await pool.query(
      `UPDATE employees 
       SET department_id = ?, designation_id = ?, salary_type = ?,
           bank_account_number = ?, bank_ifsc_code = ?,
           reporting_manager_id = ?, project_manager_id = ?,
           status = ?
       WHERE id = ? AND organization_id = ?`,
      [
        departmentId, designationId, salaryType,
        bankAccountNumber, bankIfscCode,
        reportingManagerId, projectManagerId, status,
        id, organizationId
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id, organizationId) {
    // First check if employee has any dependencies
    const dependencies = await this.checkDependencies(id, organizationId);
    if (dependencies.hasDependencies) {
      return {
        success: false,
        error: 'Cannot delete employee with existing dependencies',
        dependencies: dependencies.details
      };
    }

    const [result] = await pool.query(
      'DELETE FROM employees WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    return { success: result.affectedRows > 0 };
  }

  static async checkDependencies(id, organizationId) {
    // Check various dependencies
    const [leaves] = await pool.query(
      'SELECT COUNT(*) as count FROM leaves WHERE employee_id = ?',
      [id]
    );
    
    const [attendance] = await pool.query(
      'SELECT COUNT(*) as count FROM attendance WHERE employee_id = ?',
      [id]
    );
    
    const [loans] = await pool.query(
      'SELECT COUNT(*) as count FROM employee_loans WHERE employee_id = ?',
      [id]
    );
    
    const [payroll] = await pool.query(
      'SELECT COUNT(*) as count FROM payroll WHERE employee_id = ?',
      [id]
    );

    const hasDependencies = 
      leaves[0].count > 0 || 
      attendance[0].count > 0 || 
      loans[0].count > 0 || 
      payroll[0].count > 0;

    return {
      hasDependencies,
      details: {
        leaves: leaves[0].count,
        attendance: attendance[0].count,
        loans: loans[0].count,
        payroll: payroll[0].count
      }
    };
  }

  static async bulkCreate(employees, organizationId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const results = [];
      for (const employee of employees) {
        const [result] = await connection.query(
          `INSERT INTO employees (
            organization_id, user_id, department_id, designation_id,
            joining_date, salary_type, bank_account_number,
            bank_ifsc_code, reporting_manager_id, project_manager_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            organizationId,
            employee.userId,
            employee.departmentId,
            employee.designationId,
            employee.joiningDate,
            employee.salaryType,
            employee.bankAccountNumber,
            employee.bankIfscCode,
            employee.reportingManagerId,
            employee.projectManagerId
          ]
        );
        results.push({
          id: result.insertId,
          ...employee
        });
      }

      await connection.commit();
      return {
        success: true,
        data: results
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getManagers(organizationId) {
    const [rows] = await pool.query(
      `SELECT e.id, e.user_id, u.name, d.name as department_name, des.name as designation_name
       FROM employees e
       INNER JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       WHERE e.organization_id = ? 
       AND e.status = 'active'`,
      [organizationId]
    );
    return rows;
  }

  static async findByEmployeeCode(employeeCode, organizationId) {
    const [rows] = await pool.query(
      `SELECT e.*, 
        d.name as department_name, 
        des.name as designation_name,
        rm.name as reporting_manager_name,
        pm.name as project_manager_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN employees rm ON e.reporting_manager_id = rm.id
       LEFT JOIN employees pm ON e.project_manager_id = pm.id
       WHERE e.employee_code = ? AND e.organization_id = ?`,
      [employeeCode, organizationId]
    );
    return rows[0];
  }
}

export default Employee; 