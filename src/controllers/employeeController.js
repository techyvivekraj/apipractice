import Employee from '../models/employee/Employee.js';

class EmployeeController {
  static async getEmployees(req, res) {
    try {
      
      const {organizationId } = req.body;
      const employees = await Employee.findByOrganization(organizationId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: employees
      });
    } catch (error) {
      console.error('Get employees error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch employees',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getEmployeeById(req, res) {
    try {
      const employee = await Employee.findById(req.params.id, req.user.organizationId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Employee not found',
            path: 'id',
            location: 'params'
          }]
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: employee
      });
    } catch (error) {
      console.error('Get employee error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch employee',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async createEmployee(req, res) {
    try {
      const {
        employeeCode,
        firstName,
        middleName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        addresss,
        city,
        statee,
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
      } = req.body;

      const existingEmployee = await Employee.findByEmployeeCode(employeeCode, req.user.organizationId);
      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: 'Employee code already exists in this organization',
            path: 'employeeCode',
            location: 'body'
          }]
        });
      }

      const employeeId = await Employee.create({
        organizationId: req.user.organizationId,
        employeeCode,
        firstName,
        middleName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        address: addresss,
        city,
        state: statee,
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
      });

      const employee = await Employee.findById(employeeId, req.user.organizationId);

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Employee created successfully',
        data: employee
      });
    } catch (error) {
      console.error('Create employee error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to create employee',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        middleName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        addresss,
        city,
        statee,
        country,
        postalCode,
        emergencyContactName,
        emergencyContactPhone,
        departmentId,
        designationId,
        salaryType,
        bankAccountNumber,
        bankIfscCode,
        reportingManagerId,
        projectManagerId,
        status
      } = req.body;

      const employee = await Employee.findById(id, req.user.organizationId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Employee not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const updated = await Employee.update(id, {
        firstName,
        middleName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        address: addresss,
        city,
        state: statee,
        country,
        postalCode,
        emergencyContactName,
        emergencyContactPhone,
        departmentId,
        designationId,
        salaryType,
        bankAccountNumber,
        bankIfscCode,
        reportingManagerId,
        projectManagerId,
        status,
        organizationId: req.user.organizationId
      });

      if (!updated) {
        throw new Error('Failed to update employee');
      }

      const updatedEmployee = await Employee.findById(id, req.user.organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Employee updated successfully',
        data: updatedEmployee
      });
    } catch (error) {
      console.error('Update employee error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to update employee',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      
      const employee = await Employee.findById(id, req.user.organizationId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Employee not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const result = await Employee.delete(id, req.user.organizationId);
      if (!result.success) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: result.error,
            path: 'id',
            location: 'params',
            dependencies: result.dependencies
          }]
        });
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to delete employee',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getManagers(req, res) {
    try {
      const managers = await Employee.getManagers(req.user.organizationId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: managers
      });
    } catch (error) {
      console.error('Get managers error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch managers',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getEmployeeByCode(req, res) {
    try {
      const { employeeCode } = req.params;
      const employee = await Employee.findByEmployeeCode(employeeCode, req.user.organizationId);
      
      if (!employee) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Employee not found',
            path: 'employeeCode',
            location: 'params'
          }]
        });
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: employee
      });
    } catch (error) {
      console.error('Get employee by code error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch employee',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }
}

export default EmployeeController; 