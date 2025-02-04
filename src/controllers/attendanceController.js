import Attendance from '../models/attendance/Attendance.js';
import Employee from '../models/employee/Employee.js';

class AttendanceController {
  static async getAttendanceList(req, res) {
    try {
      // Check if user has permission to view attendance
      if (!['admin', 'view'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          errors: [{
            type: 'forbidden',
            msg: 'Not authorized to view attendance records',
            path: 'authorization',
            location: 'header'
          }]
        });
      }

      const attendance = await Attendance.getAttendanceList({
        ...req.query,
        organizationId: req.user.organizationId,
        userId: req.user.id,
        userRole: req.user.role
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: attendance
      });
    } catch (error) {
      console.error('Get attendance list error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to fetch attendance',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async markAttendance(req, res) {
    try {
      const {
        date,
        checkInTime,
        checkInLocation,
        checkInPhoto
      } = req.body;

      // Check for existing attendance
      const existing = await Attendance.checkExistingAttendance(
        req.user.employeeId,
        date
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          errors: [{
            type: 'validation',
            msg: 'Attendance already marked for this date',
            path: 'date',
            location: 'body'
          }]
        });
      }

      const attendanceId = await Attendance.markAttendance({
        organizationId: req.user.organizationId,
        employeeId: req.user.employeeId,
        date,
        checkInTime,
        checkInLocation,
        checkInPhoto
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Attendance marked successfully',
        data: { id: attendanceId }
      });
    } catch (error) {
      console.error('Mark attendance error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: error.message || 'Failed to mark attendance',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async markCheckOut(req, res) {
    try {
      const { id } = req.params;
      const { checkOutTime, checkOutLocation, checkOutPhoto } = req.body;

      const updated = await Attendance.markCheckOut({
        id,
        checkOutTime,
        checkOutLocation,
        checkOutPhoto
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          errors: [{
            type: 'notFound',
            msg: 'Attendance record not found',
            path: 'id',
            location: 'params'
          }]
        });
      }

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Check-out marked successfully'
      });
    } catch (error) {
      console.error('Mark check-out error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to mark check-out',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateApprovalStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      // Check if user can approve this attendance
      const canApprove = await Attendance.canApproveAttendance(
        id,
        req.user.id,
        req.user.role
      );

      if (!canApprove) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          errors: [{
            type: 'forbidden',
            msg: 'Not authorized to approve/reject this attendance',
            path: 'authorization',
            location: 'header'
          }]
        });
      }

      const updated = await Attendance.updateApprovalStatus({
        id,
        status,
        approvedBy: req.user.id,
        rejectionReason
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Attendance ${status} successfully`
      });
    } catch (error) {
      console.error('Update approval status error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: 'Failed to update approval status',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }
}

export default AttendanceController; 