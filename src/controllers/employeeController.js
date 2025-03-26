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

      // Extract employee data from request body
      const {
        firstName, lastName, phone, email, joiningDate, departmentId, 
        designationId, shiftId, salaryType, salary,
        middleName, employeeCode, address, country, state, city,
        postalCode, dateOfBirth, gender, bloodGroup,
        emergencyContact, emergencyName,
        reportingManagerId, bankAccountNumber, bankIfsc,
        bankName, organizationId
      } = req.body;

      // Create employee record - use snake_case keys to match the model
      const employeeId = await Employee.create({
        firstName,
        lastName,
        phone,
        email,
        joiningDate,
        departmentId,
        designationId,
        shiftId,
        salaryType,
        salary,
        middleName,
        employeeCode,
        address,
        country,
        state,
        postalCode,
        dateOfBirth,
        gender,
        bloodGroup,
        emergencyContact,
        emergencyName,
        reportingManagerId,
        bankAccountNumber,
        bankIfsc,
        bankName,
        organizationId
      });

      // Get the complete employee data
      const employeeData = await Employee.findById(employeeId, organizationId);

      // Handle document uploads with updated keys
      if (req.files) {
        const documents = {
          educationalDocs: req.files['educationalDocs']?.map(file => ({
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
          })) || [],
          professionalDocs: req.files['professionalDocs']?.map(file => ({
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
          })) || [],
          identityDocs: req.files['identityDocs']?.map(file => ({
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
          })) || [],
          addressDocs: req.files['addressDocs']?.map(file => ({
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
          })) || [],
          otherDocs: req.files['otherDocs']?.map(file => ({
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype
          })) || []
        };

        await Employee.addDocuments(employeeId, documents);
      }

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Employee added successfully',
        data: employeeData
      });
    } catch (error) {
      console.error('Add Employee Error:', error);
      
      // Clean up uploaded files if there's an error
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      // Handle duplicate email error
      if (error.message === 'Email already exists') {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'duplicate',
            msg: 'Email already exists',
            path: 'email',
            location: 'body'
          }]
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