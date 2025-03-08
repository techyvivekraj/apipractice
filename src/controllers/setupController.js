import Setup from '../models/setup/Setup.js';
import Department from '../models/setup/Department.js';
import Designation from '../models/setup/Designation.js';
import Shift from '../models/setup/Shift.js';
import Holiday from '../models/setup/Holiday.js';
import Asset from '../models/setup/Asset.js';

class SetupController {
  static async checkSetupStatus(req, res) {
    try {
      const { organizationId } = req.body;

      const setupStatus = await Setup.getSetupStatus(organizationId);

      const formattedStatus = {
        isComplete: false,
        steps: {
          departments: {
            status: setupStatus.departments.isComplete,
            count: setupStatus.departments.count,
            message: setupStatus.departments.isComplete
              ? 'Departments have been set up'
              : 'No departments added yet'
          },
          designations: {
            status: setupStatus.designations.isComplete,
            count: setupStatus.designations.count,
            message: setupStatus.designations.isComplete
              ? 'Designations have been set up'
              : 'No designations added yet'
          },
          shifts: {
            status: setupStatus.shifts.isComplete,
            count: setupStatus.shifts.count,
            message: setupStatus.shifts.isComplete
              ? 'Work shifts have been set up'
              : 'No work shifts defined yet'
          },
          keyUsers: {
            status: setupStatus.keyUsers.isComplete,
            count: setupStatus.keyUsers.count,
            message: setupStatus.keyUsers.isComplete
              ? 'Key users (HR/Managers) have been added'
              : 'No HR or managers added yet'
          }
        },
        nextSteps: []
      };

      // Determine next steps
      if (!setupStatus.departments.isComplete) {
        formattedStatus.nextSteps.push('Add at least one department');
      }
      if (!setupStatus.designations.isComplete) {
        formattedStatus.nextSteps.push('Add designations for employees');
      }
      if (!setupStatus.shifts.isComplete) {
        formattedStatus.nextSteps.push('Define work shifts');
      }
      if (!setupStatus.keyUsers.isComplete) {
        formattedStatus.nextSteps.push('Add HR personnel or managers');
      }

      formattedStatus.isComplete = await Setup.isSetupComplete(organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: formattedStatus.isComplete
          ? 'Organization setup is complete'
          : 'Organization setup is incomplete',
        data: formattedStatus
      });

    } catch (error) {
      console.error('Setup status check error:', error);

      if (error.message === 'Organization not found') {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: error.message,
            path: 'organizationId',
            location: 'params'
          }]
        });
      }

      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'An error occurred while checking setup status',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getDepartments(req, res) {
    try {
      const { organizationId } = req.query;
      const departments = await Department.findByOrganization(organizationId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: departments
      });
    } catch (error) {
      console.error('Get departments error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch departments',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getDepartmentById(req, res) {
    try {

      const { organizationId, id } = req.body;
      const department = await Department.findById({ organizationId, id });
      if (!department) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Department not found',
            path: 'id',
            location: 'params'
          }]
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: department
      });
    } catch (error) {
      console.error('Get department error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch department',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async createDepartment(req, res) {
    try {
      const { 
        name, 
        organizationId,
        noticePeriod,
        casualLeave,
        sickLeave,
        earnedLeave,
        maternityLeave,
        paternityLeave
      } = req.body;

      const departmentId = await Department.create({ 
        name, 
        organizationId,
        noticePeriod,
        casualLeave,
        sickLeave,
        earnedLeave,
        maternityLeave,
        paternityLeave
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Department created successfully',
        data: { id: departmentId, name, organizationId }
      });
    } catch (error) {
      console.error('Create department error:', error);
      if (error.message === 'Department name already exists in this organization') {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: error.message,
            path: 'name',
            location: 'body'
          }]
        });
      }
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to create department',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, 
        organizationId,
        noticePeriod,
        casualLeave,
        sickLeave,
        earnedLeave,
        maternityLeave,
        paternityLeave
      } = req.body;

      const department = await Department.findByIdAndOrganization(id, organizationId);
      if (!department) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Department not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const updated = await Department.update(id, { 
        name,
        organizationId,
        noticePeriod: noticePeriod || department.noticePeriod,
        casualLeave: casualLeave || department.casualLeave,
        sickLeave: sickLeave || department.sickLeave,
        earnedLeave: earnedLeave || department.earnedLeave,
        maternityLeave: maternityLeave || department.maternityLeave,
        paternityLeave: paternityLeave || department.paternityLeave
      });

      if (!updated) {
        throw new Error('Failed to update department');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Department updated successfully',
        data: { id, name, organizationId }
      });
    } catch (error) {
      console.error('Update department error:', error);
      if (error.message === 'Department name already exists in this organization') {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: error.message,
            path: 'name',
            location: 'body'
          }]
        });
      }
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to update department',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async deleteDepartment(req, res) {
    try {
      const { id, organizationId } = req.body;

      const department = await Department.findByIdAndOrganization(id, organizationId);
      if (!department) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Department not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const hasDesignations = await Department.hasDesignations(id, organizationId);
      if (hasDesignations) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: 'Cannot delete department with existing designations',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const deleted = await Department.delete(id, organizationId);
      if (!deleted) {
        throw new Error('Failed to delete department');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      console.error('Delete department error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to delete department',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getDesignations(req, res) {
    try {
      const { organizationId } = req.query;
      const designations = await Designation.findByOrganization(organizationId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: designations
      });
    } catch (error) {
      console.error('Get designations error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch designations',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getDesignationById(req, res) {
    try {
      const { organizationId } = req.body;
      const designation = await Designation.findByIdWithDepartment(req.params.id, organizationId);
      if (!designation) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Designation not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: designation
      });
    } catch (error) {
      console.error('Get designation error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch designation',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getDesignationsByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { organizationId } = req.body;
      const designations = await Designation.findByDepartment(departmentId, organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: designations
      });
    } catch (error) {
      console.error('Get designations by department error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch designations',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async createDesignation(req, res) {
    try {
      const { name, departmentId, organizationId } = req.body;

      const designationId = await Designation.create({
        name,
        organizationId,
        departmentId
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Designation created successfully',
        data: {
          id: designationId,
          name,
          organizationId,
          departmentId
        }
      });
    } catch (error) {
      console.error('Create designation error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to create designation',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateDesignation(req, res) {
    try {
      const { name, departmentId, organizationId } = req.body;

      const updated = await Designation.update({
        name: name,
        departmentId: departmentId,
        organizationId: organizationId
      });

      if (!updated) {
        throw new Error('Failed to update designation');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Designation updated successfully',
        data: {
          id,
          name: name,
          departmentId: departmentId,
          organizationId
        }
      });
    } catch (error) {
      console.error('Update designation error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to update designation',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async deleteDesignation(req, res) {
    try {
      const { id, organizationId } = req.body;

      const deleted = await Designation.delete({ id, organizationId });
      if (!deleted) {
        throw new Error('Failed to delete designation');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Designation deleted successfully'
      });
    } catch (error) {
      console.error('Delete designation error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to delete designation',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getShifts(req, res) {
    try {
      const { organizationId } = req.query;
      const shifts = await Shift.findAll(organizationId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: shifts
      });
    } catch (error) {
      console.error('Get shifts error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch shifts',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getShiftById(req, res) {
    try {
      const { organizationId } = req.body;
      const shift = await Shift.findById(req.params.id, organizationId);
      if (!shift) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Shift not found',
            path: 'id',
            location: 'params'
          }]
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: shift
      });
    } catch (error) {
      console.error('Get shift error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch shift',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async createShift(req, res) {
    try {
      const { name, startTime, endTime, workingDays, organizationId } = req.body;

      const shiftId = await Shift.create({
        name,
        startTime,
        endTime,
        workingDays,
        organizationId: organizationId
      });

      const shift = await Shift.findById(shiftId, organizationId);

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Shift created successfully',
        data: shift
      });
    } catch (error) {
      console.error('Create shift error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to create shift',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateShift(req, res) {
    try {
      const { id } = req.params;
      const { name, startTime, endTime, workingDays, organizationId } = req.body;

      const shift = await Shift.findById(id, organizationId);
      if (!shift) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Shift not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const updated = await Shift.update(id, {
        name: name || shift.name,
        startTime: startTime || shift.start_time,
        endTime: endTime || shift.end_time,
        workingDays: workingDays || shift.working_days,
        organizationId: organizationId
      });

      if (!updated) {
        throw new Error('Failed to update shift');
      }

      const updatedShift = await Shift.findById(id, organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Shift updated successfully',
        data: updatedShift
      });
    } catch (error) {
      console.error('Update shift error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to update shift',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async deleteShift(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.body;

      const shift = await Shift.findById(id, organizationId);
      if (!shift) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Shift not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const deleted = await Shift.delete(id, organizationId);
      if (!deleted) {
        throw new Error('Failed to delete shift');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Shift deleted successfully'
      });
    } catch (error) {
      console.error('Delete shift error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to delete shift',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getEmployeeShifts(req, res) {
    try {
      const { employeeId } = req.params;
      const { organizationId } = req.body;
      const shifts = await Shift.getEmployeeShifts(employeeId, organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: shifts
      });
    } catch (error) {
      console.error('Get employee shifts error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch employee shifts',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async assignShift(req, res) {
    try {
      const { employeeId, shiftId, startDate, endDate, organizationId } = req.body;

      const employeeExists = await Shift.verifyEmployeeExists(employeeId, organizationId);
      if (!employeeExists) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Employee not found',
            path: 'employeeId',
            location: 'body'
          }]
        });
      }

      // Verify shift exists
      const shift = await Shift.findById(shiftId, organizationId);
      if (!shift) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Shift not found',
            path: 'shiftId',
            location: 'body'
          }]
        });
      }

      const assignmentId = await Shift.assignToEmployee(
        employeeId,
        shiftId,
        startDate,
        endDate,
        organizationId
      );

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Shift assigned successfully',
        data: {
          id: assignmentId,
          employeeId,
          shiftId,
          startDate,
          endDate
        }
      });
    } catch (error) {
      console.error('Assign shift error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to assign shift',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async removeShiftAssignment(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.body;

      const removed = await Shift.removeAssignment(id, organizationId);
      if (!removed) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Shift assignment not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Shift assignment removed successfully'
      });
    } catch (error) {
      console.error('Remove shift assignment error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to remove shift assignment',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getHolidays(req, res) {
    try {
      const { organizationId } = req.body;
      const holidays = await Holiday.getHolidays(organizationId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: holidays
      });
    } catch (error) {
      console.error('Get holidays error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch holidays',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getHolidayById(req, res) {
    try {
      const { organizationId } = req.body;
      const holiday = await Holiday.getHolidayById(req.params.id, organizationId);
      if (!holiday) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Holiday not found',
            path: 'id',
            location: 'params'
          }]
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: holiday
      });
    } catch (error) {
      console.error('Get holiday error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch holiday',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async createHoliday(req, res) {
    try {
      const { name, description, date, type, status, organizationId } = req.body;

      const holidayId = await Holiday.createHoliday({
        organizationId: organizationId,
        name,
        description,
        date,
        type,
        status
      });

      const holiday = await Holiday.getHolidayById(holidayId, organizationId);

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Holiday created successfully',
        data: holiday
      });
    } catch (error) {
      console.error('Create holiday error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: 'A holiday already exists on this date',
            path: 'date',
            location: 'body'
          }]
        });
      }
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to create holiday',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateHoliday(req, res) {
    try {
      const { id } = req.params;
      const { name, description, date, type, status, organizationId } = req.body;

      const holiday = await Holiday.getHolidayById(id, organizationId);
      if (!holiday) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Holiday not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const updated = await Holiday.updateHoliday(id, {
        name: name || holiday.name,
        description: description || holiday.description,
        date: date || holiday.date,
        type: type || holiday.type,
        status: status || holiday.status,
        organizationId: organizationId
      });

      if (!updated) {
        throw new Error('Failed to update holiday');
      }

      const updatedHoliday = await Holiday.getHolidayById(id, organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Holiday updated successfully',
        data: updatedHoliday
      });
    } catch (error) {
      console.error('Update holiday error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          errors: [{
            type: 'conflict',
            msg: 'A holiday already exists on this date',
            path: 'date',
            location: 'body'
          }]
        });
      }
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to update holiday',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async deleteHoliday(req, res) {
    try {
      const { id } = req.params;
      const { organizationId } = req.body;

      const holiday = await Holiday.getHolidayById(id, organizationId);
      if (!holiday) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Holiday not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const deleted = await Holiday.deleteHoliday(id, organizationId);
      if (!deleted) {
        throw new Error('Failed to delete holiday');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Holiday deleted successfully'
      });
    } catch (error) {
      console.error('Delete holiday error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to delete holiday',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getAssets(req, res) {
    try {
      const { organizationId } = req.query;
      const assets = await Asset.findAll(organizationId);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: assets
      });
    } catch (error) {
      console.error('Get assets error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch assets',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getAssetById(req, res) {
    try {
      const { organizationId } = req.body;
      const asset = await Asset.findById(req.params.id, organizationId);
      if (!asset) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Asset not found',
            path: 'id',
            location: 'params'
          }]
        });
      }
      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: asset
      });
    } catch (error) {
      console.error('Get asset error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch asset',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async createAsset(req, res) {
    try {
      const { assetName, assignedTo, purchaseDate, condition, status, organizationId } = req.body;

      const assetId = await Asset.create({
        assetName,
        assignedTo,
        purchaseDate,
        condition,
        status,
        organizationId: organizationId
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Asset created successfully',
        data: { id: assetId }
      });
    } catch (error) {
      console.error('Create asset error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to create asset',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateAsset(req, res) {
    try {
      const { id } = req.params;
      const { assetName, assignedTo, purchaseDate, condition, status, organizationId } = req.body;

      const asset = await Asset.findById(id, organizationId);
      if (!asset) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Asset not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const updated = await Asset.update(id, {
        assetName: assetName || asset.asset_name,
        assignedTo: assignedTo || asset.assigned_to,
        purchaseDate: purchaseDate || asset.purchase_date,
        condition: condition || asset.conditionn,
        status: status || asset.status,
        organizationId: organizationId
      });

      if (!updated) {
        throw new Error('Failed to update asset');
      }

      const updatedAsset = await Asset.findById(id, organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Asset updated successfully',
        data: updatedAsset
      });
    } catch (error) {
      console.error('Update asset error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to update asset',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async deleteAsset(req, res) {
    try {
      const { id } = req.params;

      const { organizationId } = req.body;

      const asset = await Asset.findById(id, organizationId);
      if (!asset) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Asset not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      const deleted = await Asset.delete(id, organizationId);
      if (!deleted) {
        throw new Error('Failed to delete asset');
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Asset deleted successfully'
      });
    } catch (error) {
      console.error('Delete asset error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to delete asset',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async getEmployeeAssets(req, res) {
    try {
      const { employeeId } = req.params;

      const { organizationId } = req.body;
      const assets = await Asset.getEmployeeAssets(employeeId, organizationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: assets
      });
    } catch (error) {
      console.error('Get employee assets error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch employee assets',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }
}

export default SetupController; 