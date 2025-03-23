import pool from '../../config/db.js';

class Employee {
  static async create({
    firstName, middleName, emergencyContactName, emergencyContactPhone, lastName, phone, email, joiningDate, departmentId,
    designationId, shiftId, salaryType, salary, employeeCode, address, country,
    state, postalCode, dateOfBirth, gender, bloodGroup, bankAccountNumber,
    bankIfsc, bankName, reportingManagerId, organizationId
  }) {
    try {

      const [result] = await pool.query(
        `INSERT INTO employees (
          first_name, middle_name,emergency_contact_name,emergency_contact_phone, last_name, phone, email, joining_date, 
          department_id, designation_id, shift_id, salary_type, salary, 
          employee_code, address, country, state, postal_code, date_of_birth, 
          gender, blood_group, bank_account_number, bank_ifsc_code, bank_name,reporting_manager_id,
          organization_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firstName, middleName, emergencyContactName, emergencyContactPhone, lastName, phone, email, joiningDate,
          departmentId, designationId, shiftId, salaryType, salary,
          employeeCode, address, country, state, postalCode, dateOfBirth,
          gender, bloodGroup, bankAccountNumber, bankIfsc, bankName, reportingManagerId, organizationId
        ]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('email')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async addDocuments(employeeId, documents) {
    // Flatten all documents into a single array
    const allDocuments = [
      ...(documents.educationalDocuments || []).map(doc => [employeeId, 'educational', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType]),
      ...(documents.professionalDocuments || []).map(doc => [employeeId, 'professional', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType]),
      ...(documents.identityDocuments || []).map(doc => [employeeId, 'identity', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType]),
      ...(documents.addressDocuments || []).map(doc => [employeeId, 'address', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType]),
      ...(documents.otherDocuments || []).map(doc => [employeeId, 'others', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType])
    ];

    if (allDocuments.length > 0) {
      await pool.query(
        `INSERT INTO employee_documents (
          employee_id, document_type, file_name, file_path, 
          file_size, mime_type
        ) VALUES ?`,
        [allDocuments]
      );
    }
  }

  static async findById(employeeId, organizationId) {
    const [rows] = await pool.query(
      `SELECT e.*, d.name as department_name, ds.name as designation_name, s.name as shift_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN shifts s ON e.shift_id = s.id
       WHERE e.id = ? AND e.organization_id = ?`,
      [employeeId, organizationId]
    );
    return rows[0];
  }

  static async findByOrganization(organizationId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT e.*, d.name as department_name, ds.name as designation_name, s.name as shift_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations ds ON e.designation_id = ds.id
       LEFT JOIN shifts s ON e.shift_id = s.id
       WHERE e.organization_id = ?
       LIMIT ? OFFSET ?`,
      [organizationId, limit, offset]
    );
    return rows;
  }

  static async getDocuments(employeeId) {
    const [rows] = await pool.query(
      'SELECT * FROM employee_documents WHERE employee_id = ?',
      [employeeId]
    );
    return rows;
  }

  static async update(employeeId, organizationId, updateData) {

    const [result] = await pool.query(
      `UPDATE employees 
       SET first_name = ?, middle_name = ?, last_name = ?, phone = ?, 
           email = ?, joining_date = ?, department_id = ?, designation_id = ?, 
           shift_id = ?, salary_type = ?, salary = ?, employee_code = ?, 
           address = ?, country = ?, state = ?, postal_code = ?, 
           date_of_birth = ?, gender = ?, blood_group = ?, 
           bank_account_number = ?, bank_ifsc_code = ?, bank_name = ?,
           reporting_manager_id = ?
       WHERE id = ? AND organization_id = ?`,
      [
        updateData.firstName, updateData.middleName, updateData.lastName,
        updateData.phone, updateData.email, updateData.joiningDate,
        updateData.departmentId, updateData.designationId, updateData.shiftId,
        updateData.salaryType, updateData.salary, updateData.employeeCode,
        updateData.address, updateData.country, updateData.state,
        updateData.postalCode, updateData.dateOfBirth, updateData.gender,
        updateData.bloodGroup, updateData.bankAccountNumber, updateData.bankIfsc,
        updateData.bankName, updateData.reportingManagerId,
        employeeId, organizationId
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(employeeId, organizationId) {
    const [result] = await pool.query(
      'DELETE FROM employees WHERE id = ? AND organization_id = ?',
      [employeeId, organizationId]
    );
    return result.affectedRows > 0;
  }
}

export default Employee;
