import Employee from '../models/employee/Employee.js';
import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmployeeController {
  static async getEmployees(req, res) {
    try {
      const { organizationId } = req.query;
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
      } = req.body;

      // Check if employee code already exists (if provided)
      if (employeeCode) {
        const existingEmployee = await Employee.findByEmployeeCode(employeeCode, req.body.organizationId || req.user.organizationId);
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
      }

      // Generate a unique employee code if not provided
      const finalEmployeeCode = employeeCode || await this.generateEmployeeCode(req.body.organizationId || req.user.organizationId);

      // Process document files if they exist
      let processedDocuments = {};
      if (documents && Object.keys(documents).length > 0) {
        processedDocuments = await this.processDocumentFiles(documents);
      }

      const employeeId = await Employee.create({
        organizationId: req.body.organizationId || req.user.organizationId,
        employeeCode: finalEmployeeCode,
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
        documents: processedDocuments
      });

      const employee = await Employee.findById(employeeId, req.body.organizationId || req.user.organizationId);

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
          msg: 'Failed to create employee: ' + error.message,
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
        status,
        documents
      } = req.body;

      const employee = await Employee.findById(id, req.body.organizationId || req.user.organizationId);
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

      // Process document files if they exist
      let processedDocuments = {};
      if (documents && Object.keys(documents).length > 0) {
        processedDocuments = await this.processDocumentFiles(documents);
      }

      const updated = await Employee.update(id, {
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
        status,
        documents: processedDocuments,
        organizationId: req.body.organizationId || req.user.organizationId
      });

      if (!updated) {
        throw new Error('Failed to update employee');
      }

      const updatedEmployee = await Employee.findById(id, req.body.organizationId || req.user.organizationId);

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
          msg: 'Failed to update employee: ' + error.message,
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

  // Helper method to generate a unique employee code
  static async generateEmployeeCode(organizationId) {
    try {
      // Get the current year
      const year = new Date().getFullYear().toString().slice(-2);
      
      // Get the count of employees in the organization
      const [result] = await pool.query(
        'SELECT COUNT(*) as count FROM employees WHERE organization_id = ?',
        [organizationId]
      );
      
      const count = result[0].count + 1;
      
      // Format: EMP-YY-XXXX (where YY is year and XXXX is sequential number)
      return `EMP-${year}-${count.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Generate employee code error:', error);
      throw new Error('Failed to generate employee code');
    }
  }
  
  // Helper method to process document files
  static async processDocumentFiles(documents) {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads/employee_documents');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const processedDocuments = {};
      
      for (const [category, files] of Object.entries(documents)) {
        if (Array.isArray(files) && files.length > 0) {
          processedDocuments[category] = [];
          
          for (const file of files) {
            // In a real implementation, this would save the file to disk or cloud storage
            // For now, we'll just simulate file processing
            
            // Generate a unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExt = path.extname(file.name);
            const fileName = `${timestamp}-${randomString}${fileExt}`;
            const filePath = path.join(uploadsDir, fileName);
            
            // In a real implementation, we would write the file to disk
            // fs.writeFileSync(filePath, file.data);
            
            processedDocuments[category].push({
              name: file.name,
              path: `/uploads/employee_documents/${fileName}`,
              size: file.size || 0,
              type: file.type || ''
            });
          }
        }
      }
      
      return processedDocuments;
    } catch (error) {
      console.error('Process document files error:', error);
      throw new Error('Failed to process document files');
    }
  }
  
  // Get employee documents
  static async getEmployeeDocuments(req, res) {
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
      
      const documents = await Employee.getEmployeeDocuments(id);
      
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: documents
      });
    } catch (error) {
      console.error('Get employee documents error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch employee documents',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }
}

export default EmployeeController; 