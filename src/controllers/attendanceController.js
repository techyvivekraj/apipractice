import Attendance from '../models/attendance/Attendance.js';

class AttendanceController {
  static async getAttendanceList(req, res) {
    try {
      const filters = {
        organizationId: req.user.organizationId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        employeeId: req.query.employeeId,
        departmentId: req.query.departmentId,
        designationId: req.query.designationId,
        employeeName: req.query.employeeName,
        status: req.query.status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await Attendance.getAttendanceList(filters);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
          data: result.data,
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('Get attendance list error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        data: {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        },
        errors: [{
          type: 'server',
          msg: 'Failed to fetch attendance records',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async markCheckIn(req, res) {
    try {
      const attendance = await Attendance.markCheckIn({
        organizationId: req.user.organizationId,
        employeeId: req.body.employeeId,
        shiftId: req.body.shiftId,
        date: req.body.date,
        checkInTime: req.body.checkInTime,
        checkInLocation: req.body.checkInLocation,
        checkInPhoto: req.body.checkInPhoto
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Check-in marked successfully',
        data: attendance
      });
    } catch (error) {
      console.error('Mark check-in error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: error.message || 'Failed to mark check-in',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async markCheckOut(req, res) {
    try {
      const attendance = await Attendance.markCheckOut({
        id: req.params.id,
        checkOutTime: req.body.checkOutTime,
        checkOutLocation: req.body.checkOutLocation,
        checkOutPhoto: req.body.checkOutPhoto
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Check-out marked successfully',
        data: attendance
      });
    } catch (error) {
      console.error('Mark check-out error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: error.message || 'Failed to mark check-out',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }

  static async updateApprovalStatus(req, res) {
    try {
      const attendance = await Attendance.updateApprovalStatus({
        id: req.params.id,
        status: req.body.status,
        approvedBy: req.user.id,
        rejectionReason: req.body.rejectionReason
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Attendance ${req.body.status} successfully`,
        data: attendance
      });
    } catch (error) {
      console.error('Update approval status error:', error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        errors: [{
          type: 'server',
          msg: error.message || 'Failed to update approval status',
          path: 'server',
          location: 'internal'
        }]
      });
    }
  }
}

export default AttendanceController; 