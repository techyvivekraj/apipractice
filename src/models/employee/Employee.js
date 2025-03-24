import pool from '../../config/db.js';
import convertToCamelCase from '../../utils/convertToCamelCase.js';
class Employee {
  static async create({
    firstName, middleName, lastName, phone, email, joiningDate, departmentId, 
    designationId, shiftId, salaryType, salary, employeeCode, address, country, 
    state, postalCode, dateOfBirth, gender, bloodGroup, bankAccountNumber, 
    bankIfsc, bankName, reportingManagerId, organizationId, 
    emergencyContact, emergencyName
  }) {
    try {
      const [result] = await pool.query(
        `INSERT INTO employees ( 
          first_name, middle_name, last_name, phone, email, joining_date, 
          department_id, designation_id, shift_id, salary_type, salary, 
          employee_code, address, country, state, postal_code, date_of_birth, 
          gender, blood_group, bank_account_number, bank_ifsc_code, bank_name, 
          reporting_manager_id, organization_id, 
          emergency_contact_phone, emergency_contact_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firstName, middleName, lastName, phone, email, joiningDate, 
          departmentId, designationId, shiftId, salaryType, salary, 
          employeeCode, address, country, state, postalCode, dateOfBirth, 
          gender, bloodGroup, bankAccountNumber, bankIfsc, bankName, 
          reportingManagerId, organizationId, 
          emergencyContact, emergencyName
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
    const allDocuments = [
      ...(documents.educationalDocs || []).map(doc => [
        employeeId, 'educational', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType
      ]),
      ...(documents.professionalDocs || []).map(doc => [
        employeeId, 'professional', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType
      ]),
      ...(documents.identityDocs || []).map(doc => [
        employeeId, 'identity', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType
      ]),
      ...(documents.addressDocs || []).map(doc => [
        employeeId, 'address', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType
      ]),
      ...(documents.otherDocs || []).map(doc => [
        employeeId, 'others', doc.fileName, doc.filePath, doc.fileSize, doc.mimeType
      ])
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
    `SELECT 
      e.id,
      e.first_name,
      e.middle_name,
      e.last_name,
      e.phone,
      e.email,
      e.joining_date,
      e.department_id,
      e.designation_id,
      e.shift_id,
      e.salary_type,
      e.salary,
      e.employee_code,
      e.address,
      e.country,
      e.state,
      e.city,
      e.postal_code,
      e.date_of_birth,
      e.gender,
      e.blood_group,
      e.bank_account_number,
      e.bank_ifsc_code AS bank_ifsc,
      e.bank_name,
      e.reporting_manager_id,
      e.organization_id,
      e.emergency_contact_phone AS emergency_contact,
      e.emergency_contact_name AS emergency_name,
      e.status,
      d.name AS department_name,
      ds.name AS designation_name,
      s.name AS shift_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN designations ds ON e.designation_id = ds.id
    LEFT JOIN shifts s ON e.shift_id = s.id
    WHERE e.id = ? AND e.organization_id = ?`,
    [employeeId, organizationId]
  );

  if (rows[0]) {
    // Convert keys to camelCase using Object.entries() and reduce()
    const formattedResult = Object.entries(rows[0]).reduce((acc, [key, value]) => {
      acc[convertToCamelCase(key)] = value;
      return acc;
    }, {});

    return formattedResult;
  }

  return null;
}

static async findByOrganization(organizationId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT 
      e.id,
      e.first_name,
      e.middle_name,
      e.last_name,
      e.phone,
      e.email,
      e.joining_date,
      e.department_id,
      e.designation_id,
      e.shift_id,
      e.salary_type,
      e.salary,
      e.employee_code,
      e.address,
      e.country,
      e.state,
      e.city,
      e.postal_code,
      e.date_of_birth,
      e.gender,
      e.blood_group,
      e.bank_account_number,
      e.bank_ifsc_code AS bank_ifsc,
      e.bank_name,
      e.reporting_manager_id,
      e.organization_id,
      e.emergency_contact_phone AS emergency_contact,
      e.emergency_contact_name AS emergency_name,
      e.status,
      d.name AS department_name,
      ds.name AS designation_name,
      s.name AS shift_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN designations ds ON e.designation_id = ds.id
    LEFT JOIN shifts s ON e.shift_id = s.id
    WHERE e.organization_id = ?
    LIMIT ? OFFSET ?`,
    [organizationId, limit, offset]
  );

  // Convert each row's keys to camelCase using map and reduce
  return rows.map(row => 
    Object.entries(row).reduce((acc, [key, value]) => {
      acc[convertToCamelCase(key)] = value;
      return acc;
    }, {})
  );
}

  static async getDocuments(employeeId) {
    const [rows] = await pool.query(
      'SELECT * FROM employee_documents WHERE employee_id = ?',
      [employeeId]
    );
    return rows;
  }
  static async update(employeeId, organizationId, updateData) {
    // Convert camelCase keys to snake_case
    const updateDataSnakeCase = {
      first_name: updateData.firstName,
      middle_name: updateData.middleName,
      last_name: updateData.lastName,
      phone: updateData.phone,
      email: updateData.email,
      joining_date: updateData.joiningDate,
      department_id: updateData.departmentId,
      designation_id: updateData.designationId,
      shift_id: updateData.shiftId,
      salary_type: updateData.salaryType,
      salary: updateData.salary,
      employee_code: updateData.employeeCode,
      address: updateData.address,
      country: updateData.country,
      state: updateData.state,
      postal_code: updateData.postalCode,
      date_of_birth: updateData.dateOfBirth,
      gender: updateData.gender,
      blood_group: updateData.bloodGroup,
      bank_account_number: updateData.bankAccountNumber,
      bank_ifsc_code: updateData.bankIfsc,
      bank_name: updateData.bankName,
      reporting_manager_id: updateData.reportingManagerId,
      emergency_contact_phone: updateData.emergencyContact,
      emergency_contact_name: updateData.emergencyName
    };
  
    const [result] = await pool.query(
      `UPDATE employees 
       SET first_name = ?, middle_name = ?, last_name = ?, phone = ?, 
           email = ?, joining_date = ?, department_id = ?, designation_id = ?, 
           shift_id = ?, salary_type = ?, salary = ?, employee_code = ?, 
           address = ?, country = ?, state = ?, postal_code = ?, 
           date_of_birth = ?, gender = ?, blood_group = ?, 
           bank_account_number = ?, bank_ifsc_code = ?, bank_name = ?,
           reporting_manager_id = ?,
           emergency_contact_phone = ?, emergency_contact_name = ?
       WHERE id = ? AND organization_id = ?`,
      [
        updateDataSnakeCase.first_name, updateDataSnakeCase.middle_name, updateDataSnakeCase.last_name,
        updateDataSnakeCase.phone, updateDataSnakeCase.email, updateDataSnakeCase.joining_date,
        updateDataSnakeCase.department_id, updateDataSnakeCase.designation_id, updateDataSnakeCase.shift_id,
        updateDataSnakeCase.salary_type, updateDataSnakeCase.salary, updateDataSnakeCase.employee_code,
        updateDataSnakeCase.address, updateDataSnakeCase.country, updateDataSnakeCase.state,
        updateDataSnakeCase.postal_code, updateDataSnakeCase.date_of_birth, updateDataSnakeCase.gender,
        updateDataSnakeCase.blood_group, updateDataSnakeCase.bank_account_number, updateDataSnakeCase.bank_ifsc_code,
        updateDataSnakeCase.bank_name, updateDataSnakeCase.reporting_manager_id,
        updateDataSnakeCase.emergency_contact_phone, updateDataSnakeCase.emergency_contact_name,
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
