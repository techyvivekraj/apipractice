import Attendance from '../models/attendance/Attendance.js';

class AttendanceController {
  static async getAttendanceList(req, res) {
    try {
      const filters = {
        organizationId: req.user.organizationId,
        date: req.query.date || null,  // Optional: single date
        startDate: req.query.startDate || null, // Optional: for future range use
        endDate: req.query.endDate || null,
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
}

export default AttendanceController;
