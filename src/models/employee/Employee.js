import pool from '../../config/db.js';

class Employee {
  static async findByOrganization(organizationId) {
    const [rows] = await pool.query(
      `SELECT e.*, 
        d.name as department_name, 
        des.name as designation_name,
        s.name as shift_name,
        rm.first_name as reporting_manager_first_name,
        rm.last_name as reporting_manager_last_name,
        pm.first_name as project_manager_first_name,
        pm.last_name as project_manager_last_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN shifts s ON e.shift_id = s.id
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
        s.name as shift_name,
        rm.first_name as reporting_manager_first_name,
        rm.last_name as reporting_manager_last_name,
        pm.first_name as project_manager_first_name,
        pm.last_name as project_manager_last_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN shifts s ON e.shift_id = s.id
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
    shiftId,
    joiningDate,
    salaryType,
    salary,
    bankAccountNumber,
    bankIfscCode,
    reportingManagerId,
    projectManagerId,
    documents
  }) {
    const [result] = await pool.query(
      `INSERT INTO employees (
        organization_id, employee_code, first_name, middle_name, last_name,
        email, phone, date_of_birth, gender, blood_group,
        addresss, city, statee, country, postal_code,
        emergency_contact_name, emergency_contact_phone,
        department_id, designation_id, shift_id, joining_date,
        salary_type, salary, bank_account_number, bank_ifsc_code,
        reporting_manager_id, project_manager_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizationId, employeeCode, firstName, middleName, lastName,
        email, phone, dateOfBirth, gender, bloodGroup,
        address, city, state, country, postalCode,
        emergencyContactName, emergencyContactPhone,
        departmentId, designationId, shiftId, joiningDate,
        salaryType, salary, bankAccountNumber, bankIfscCode,
        reportingManagerId, projectManagerId
      ]
    );
    
    const employeeId = result.insertId;
    
    // If documents are provided, store them
    if (documents && Object.keys(documents).length > 0) {
      await this.storeEmployeeDocuments(employeeId, documents);
    }
    
    return employeeId;
  }

  static async update(id, {
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
    shiftId,
    joiningDate,
    salaryType,
    salary,
    bankAccountNumber,
    bankIfscCode,
    reportingManagerId,
    projectManagerId,
    status,
    documents,
    organizationId
  }) {
    const [result] = await pool.query(
      `UPDATE employees 
       SET first_name = ?, middle_name = ?, last_name = ?,
           email = ?, phone = ?, date_of_birth = ?, gender = ?, blood_group = ?,
           addresss = ?, city = ?, statee = ?, country = ?, postal_code = ?,
           emergency_contact_name = ?, emergency_contact_phone = ?,
           department_id = ?, designation_id = ?, shift_id = ?, joining_date = ?,
           salary_type = ?, salary = ?, bank_account_number = ?, bank_ifsc_code = ?,
           reporting_manager_id = ?, project_manager_id = ?,
           status = ?
       WHERE id = ? AND organization_id = ?`,
      [
        firstName, middleName, lastName,
        email, phone, dateOfBirth, gender, bloodGroup,
        address, city, state, country, postalCode,
        emergencyContactName, emergencyContactPhone,
        departmentId, designationId, shiftId, joiningDate,
        salaryType, salary, bankAccountNumber, bankIfscCode,
        reportingManagerId, projectManagerId, status,
        id, organizationId
      ]
    );
    
    // If documents are provided, update them
    if (documents && Object.keys(documents).length > 0) {
      await this.updateEmployeeDocuments(id, documents);
    }
    
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
        s.name as shift_name,
        rm.first_name as reporting_manager_first_name,
        rm.last_name as reporting_manager_last_name,
        pm.first_name as project_manager_first_name,
        pm.last_name as project_manager_last_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations des ON e.designation_id = des.id
       LEFT JOIN shifts s ON e.shift_id = s.id
       LEFT JOIN employees rm ON e.reporting_manager_id = rm.id
       LEFT JOIN employees pm ON e.project_manager_id = pm.id
       WHERE e.employee_code = ? AND e.organization_id = ?`,
      [employeeCode, organizationId]
    );
    return rows[0];
  }

  // Method to store employee documents
  static async storeEmployeeDocuments(employeeId, documents) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      for (const [category, files] of Object.entries(documents)) {
        if (Array.isArray(files) && files.length > 0) {
          for (const file of files) {
            await connection.query(
              `INSERT INTO employee_documents (
                employee_id, document_type, file_name, file_path, file_size, mime_type
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                employeeId,
                category,
                file.name,
                file.path || '',
                file.size || 0,
                file.type || ''
              ]
            );
          }
        }
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Method to update employee documents
  static async updateEmployeeDocuments(employeeId, documents) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // First, delete existing documents for this employee
      await connection.query(
        'DELETE FROM employee_documents WHERE employee_id = ?',
        [employeeId]
      );
      
      // Then add the new documents
      await this.storeEmployeeDocuments(employeeId, documents);
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Method to get employee documents
  static async getEmployeeDocuments(employeeId) {
    const [rows] = await pool.query(
      `SELECT id, document_type, file_name, file_path, file_size, mime_type, created_at
       FROM employee_documents
       WHERE employee_id = ?
       ORDER BY document_type, created_at`,
      [employeeId]
    );
    
    // Group documents by category
    const documents = {};
    for (const row of rows) {
      if (!documents[row.document_type]) {
        documents[row.document_type] = [];
      }
      documents[row.document_type].push(row);
    }
    
    return documents;
  }
}

export default Employee; 