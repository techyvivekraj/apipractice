import pool from '../../config/db.js';

class Attendance {
  // Get attendance list with role-based access
  static async getAttendanceList({
    organizationId,
    startDate,
    endDate,
    employeeId,
    status,
    approvalStatus,
    userId,
    userRole,
    page = 1,
    limit = 10
  }) {
    const offset = (page - 1) * limit;
    const params = [organizationId];
    
    let query = `
      SELECT 
        a.*,
        e.first_name,
        e.last_name,
        e.employee_code,
        e.reporting_manager_id,
        CONCAT(u.first_name, ' ', u.last_name) as approved_by_name
      FROM attendance a
      INNER JOIN employees e ON a.employee_id = e.id
      LEFT JOIN users u ON a.approved_by = u.id
      WHERE a.organization_id = ?
    `;

    // If not admin, only show subordinates' attendance
    if (userRole !== 'admin') {
      query += ' AND e.reporting_manager_id = ?';
      params.push(userId);
    }

    if (startDate) {
      query += ' AND a.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND a.date <= ?';
      params.push(endDate);
    }
    if (employeeId) {
      query += ' AND a.employee_id = ?';
      params.push(employeeId);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (approvalStatus) {
      query += ' AND a.approval_status = ?';
      params.push(approvalStatus);
    }

    query += ` ORDER BY a.date DESC, a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get employee's active shift for a specific date
  static async getEmployeeShift(employeeId, date, organizationId) {
    const [shifts] = await pool.query(
      `SELECT s.* 
       FROM employee_shifts es
       INNER JOIN shifts s ON es.shift_id = s.id
       WHERE es.employee_id = ?
       AND es.organization_id = ?
       AND es.status = 'active'
       AND es.start_date <= ?
       AND (es.end_date IS NULL OR es.end_date >= ?)
       ORDER BY es.is_primary DESC
       LIMIT 1`,
      [employeeId, organizationId, date, date]
    );
    return shifts[0];
  }

  // Check for existing attendance
  static async checkExistingAttendance(employeeId, date) {
    const [rows] = await pool.query(
      `SELECT * FROM attendance 
       WHERE employee_id = ? 
       AND DATE(date) = DATE(?)`,
      [employeeId, date]
    );
    return rows[0];
  }

  // Mark attendance with selfie and location
  static async markAttendance({
    organizationId,
    employeeId,
    date,
    checkInTime,
    checkInLocation,
    checkInPhoto,
    shiftId
  }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check for existing attendance
      const existing = await this.checkExistingAttendance(employeeId, date);
      if (existing) {
        throw new Error('Attendance already marked for this date');
      }

      const [result] = await connection.query(
        `INSERT INTO attendance (
          organization_id, employee_id, shift_id, date,
          check_in, check_in_location, check_in_photo,
          status, approval_status
        ) VALUES (?, ?, ?, ?, ?, ST_GeomFromText(?), ?, 'present', 'pending')`,
        [
          organizationId,
          employeeId,
          shiftId,
          date,
          checkInTime,
          `POINT(${checkInLocation.latitude} ${checkInLocation.longitude})`,
          checkInPhoto
        ]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update check-out
  static async markCheckOut({
    id,
    checkOutTime,
    checkOutLocation,
    checkOutPhoto
  }) {
    const [result] = await pool.query(
      `UPDATE attendance 
       SET check_out = ?,
           check_out_location = ST_GeomFromText(?),
           check_out_photo = ?,
           work_hours = TIMESTAMPDIFF(HOUR, check_in, ?)
       WHERE id = ?`,
      [
        checkOutTime,
        `POINT(${checkOutLocation.latitude} ${checkOutLocation.longitude})`,
        checkOutPhoto,
        checkOutTime,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  // Check if user can approve attendance
  static async canApproveAttendance(attendanceId, userId, userRole) {
    const [rows] = await pool.query(
      `SELECT a.*, e.reporting_manager_id 
       FROM attendance a
       INNER JOIN employees e ON a.employee_id = e.id
       WHERE a.id = ?`,
      [attendanceId]
    );

    if (!rows.length) return false;

    const attendance = rows[0];
    
    // Admin can approve any attendance
    if (userRole === 'admin') return true;

    // User is the reporting manager of the employee
    if (attendance.reporting_manager_id === userId) return true;

    return false;
  }

  // Update approval status
  static async updateApprovalStatus({
    id,
    status,
    approvedBy,
    rejectionReason
  }) {
    const [result] = await pool.query(
      `UPDATE attendance 
       SET approval_status = ?,
           approved_by = ?,
           approval_date = NOW(),
           rejection_reason = ?
       WHERE id = ? 
       AND employee_id != ?`, // Prevent self-approval
      [status, approvedBy, rejectionReason, id, approvedBy]
    );
    return result.affectedRows > 0;
  }

  // Helper methods
  static async validateLocation(checkInLocation, officeLocation, radius) {
    // Implement haversine formula to calculate distance
    // Return true if within radius
    return true; // Placeholder
  }

  // Modified calculateAttendanceStatus to use shift timings
  static async calculateAttendanceStatus(checkInTime, shift, settings) {
    const checkInDateTime = new Date(checkInTime);
    const [hours, minutes] = shift.start_time.split(':');
    const shiftStartTime = new Date(checkInDateTime);
    shiftStartTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const lateThreshold = new Date(shiftStartTime.getTime() + settings.late_threshold_minutes * 60000);
    
    if (checkInDateTime <= shiftStartTime) {
      return 'present';
    } else if (checkInDateTime <= lateThreshold) {
      return 'present';
    } else {
      return 'late';
    }
  }
}

export default Attendance; 