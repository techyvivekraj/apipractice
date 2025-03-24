import pool from '../../config/db.js';

class Attendance {
  // Get attendance list with filters
  static async getAttendanceList({
    organizationId,
    startDate,
    endDate,
    employeeId,
    departmentId,
    designationId,
    employeeName,
    status,
    page = 1,
    limit = 10
  }) {
    try {
        const offset = (page - 1) * limit;
        
        // Base query to get all active employees first
        let query = `
            SELECT 
                e.id as employee_id,
                e.first_name,
                e.last_name,
                e.employee_code,
                d.name as department_name,
                d.id as department_id,
                ds.name as designation_name,
                s.name as shift_name,
                s.start_time as shift_start_time,
                s.end_time as shift_end_time,
                a.id,
                a.date,
                a.check_in,
                a.check_out,
                COALESCE(a.status, 'not_set') as status,
                a.approval_status
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations ds ON e.designation_id = ds.id
            LEFT JOIN employee_shifts es ON e.id = es.employee_id 
                AND es.status = 'active'
            LEFT JOIN shifts s ON es.shift_id = s.id
            LEFT JOIN attendance a ON e.id = a.employee_id 
                AND DATE(a.date) = CURDATE()
            WHERE e.organization_id = ?
            AND e.status = 'active'
            AND e.joining_date <= CURDATE()
        `;

        const params = [organizationId];

        // Add filters only if they exist
        if (departmentId) {
            query += ' AND e.department_id = ?';
            params.push(departmentId);
        }

        if (employeeName) {
            query += ' AND (e.first_name LIKE ? OR e.last_name LIKE ?)';
            params.push(`%${employeeName}%`, `%${employeeName}%`);
        }

        if (status && status !== 'not_set') {
            query += ' AND COALESCE(a.status, "not_set") = ?';
            params.push(status);
        }

        // Get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM (${query}) as count_table`, 
            params
        );
        
        // Add sorting and pagination
        query += ' ORDER BY e.first_name ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        // Get the actual data
        const [rows] = await pool.query(query, params);

        return {
            data: rows,
            pagination: {
                total: countResult[0].total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        };

    } catch (error) {
        console.error('Error in getAttendanceList:', error);
        throw error;
    }
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

  // Mark attendance (check-in)
  static async markCheckIn({
    organizationId,
    employeeId,
    shiftId,
    date,
    checkInTime,
    checkInLocation,
    checkInPhoto
  }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check for existing attendance
      const [existing] = await connection.query(
        'SELECT id FROM attendance WHERE employee_id = ? AND DATE(date) = DATE(?)',
        [employeeId, date]
      );

      if (existing.length > 0) {
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
      
      // Fetch the inserted record with details
      const [attendance] = await connection.query(
        `SELECT a.*, e.first_name, e.last_name, e.employee_code,
         s.name as shift_name, s.start_time, s.end_time
         FROM attendance a
         INNER JOIN employees e ON a.employee_id = e.id
         INNER JOIN shifts s ON a.shift_id = s.id
         WHERE a.id = ?`,
        [result.insertId]
      );

      return attendance[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Mark check-out
  static async markCheckOut({
    id,
    checkOutTime,
    checkOutLocation,
    checkOutPhoto
  }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
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

      if (result.affectedRows === 0) {
        throw new Error('Attendance record not found');
      }

      await connection.commit();

      // Fetch updated record
      const [attendance] = await connection.query(
        `SELECT a.*, e.first_name, e.last_name, e.employee_code,
         s.name as shift_name, s.start_time, s.end_time
         FROM attendance a
         INNER JOIN employees e ON a.employee_id = e.id
         INNER JOIN shifts s ON a.shift_id = s.id
         WHERE a.id = ?`,
        [id]
      );

      return attendance[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
       WHERE id = ?`,
      [status, approvedBy, rejectionReason, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Attendance record not found');
    }

    const [attendance] = await pool.query(
      `SELECT a.*, e.first_name, e.last_name, e.employee_code,
       s.name as shift_name, s.start_time, s.end_time
       FROM attendance a
       INNER JOIN employees e ON a.employee_id = e.id
       INNER JOIN shifts s ON a.shift_id = s.id
       WHERE a.id = ?`,
      [id]
    );

    return attendance[0];
  }

  // Bulk mark attendance
  static async bulkMarkAttendance(attendanceData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const results = [];
      for (const data of attendanceData) {
        const [result] = await connection.query(
          `INSERT INTO attendance (
            organization_id, employee_id, date, status,
            remarks, created_by, approval_status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
          ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            remarks = VALUES(remarks),
            updated_by = VALUES(created_by),
            updated_at = NOW()`,
          [
            data.organizationId,
            data.employeeId,
            data.date,
            data.status,
            data.remarks,
            data.createdBy
          ]
        );
        results.push(result);
      }

      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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