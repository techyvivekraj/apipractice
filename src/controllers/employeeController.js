import Employee from '../models/employee/Employee.js';
import fs from 'fs';
import { validationResult } from 'express-validator';

class EmployeeController {
  static async addEmployee(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          errors: errors.array()
        });
      }

      const {
        firstName, lastName, phone, email, joiningDate, departmentId, designationId, shiftId, salaryType, salary,
        middleName,emergencyContactName,emergencyContactPhone, employeeCode, address, country, state, postalCode, dateOfBirth, gender, bloodGroup,
        bankAccountNumber, bankIfsc, bankName, organizationId
      } = req.body;

      // Create employee
      const employeeId = await Employee.create({
        firstName, lastName, phone, email, joiningDate, departmentId, designationId, shiftId, salaryType, salary,
        middleName,emergencyContactName,emergencyContactPhone, employeeCode, address, country, state, postalCode, dateOfBirth, gender, bloodGroup,
        bankAccountNumber, bankIfsc, bankName, organizationId
      });

      // Handle document uploads if any
      if (req.files) {
        const documents = {
          educationalDocuments: [],
          professionalDocuments: [],
          identityDocuments: [],
          addressDocuments: [],
          otherDocuments: []
        };

        // Process each uploaded file
        for (const file of req.files) {
          const documentType = file.fieldname.replace('Documents', '');
          
          documents[`${documentType}Documents`].push({
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
          });
        }

        // Add documents to database
        await Employee.addDocuments(employeeId, documents);
      }

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Employee added successfully',
        data: { employeeId }
      });
    } catch (error) {
      console.error('Add Employee Error:', error);
      
      // Clean up uploaded files if there's an error
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to add employee',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getEmployee(req, res) {
    try {
      const { organizationId,id } = req.query;

      const employee = await Employee.findById(id, organizationId);
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

      const documents = await Employee.getDocuments(id);
      employee.documents = documents;

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: employee
      });
    } catch (error) {
      console.error('Get Employee Error:', error);
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

  static async getEmployees(req, res) {
    try {
      const { organizationId } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const employees = await Employee.findByOrganization(organizationId, page, limit);
      
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: employees
      });
    } catch (error) {
      console.error('Get Employees Error:', error);
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

  static async updateEmployee(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { organizationId } = req.query;
      const updateData = req.body;

      const employee = await Employee.findById(id, organizationId);
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

      const updated = await Employee.update(id, organizationId, updateData);
      if (!updated) {
        throw new Error('Failed to update employee');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Employee updated successfully'
      });
    } catch (error) {
      console.error('Update Employee Error:', error);
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
      const { organizationId } = req.query;

      const employee = await Employee.findById(id, organizationId);
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

      const deleted = await Employee.delete(id, organizationId);
      if (!deleted) {
        throw new Error('Failed to delete employee');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error('Delete Employee Error:', error);
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
}

export default EmployeeController;