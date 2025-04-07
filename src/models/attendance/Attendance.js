import pool from "../../config/db.js";

class Attendance {
  static async getAttendanceList({
    organizationId,
    date = null,
    departmentId,
    designationId,
    employeeName,
    status,
    page = 1,
    limit = 10
  }) {
    try {
      const offset = (page - 1) * limit;
      const selectedDate = date || new Date().toISOString().slice(0, 10);

      const baseQuery = `
        FROM 
          employees e
        LEFT JOIN 
          JSON_TABLE(e.shift_id, '$[*]' COLUMNS (shift_id INT PATH '$')) sh ON TRUE
        LEFT JOIN 
          shifts s ON sh.shift_id = s.id
        LEFT JOIN 
          attendance a ON e.id = a.employee_id AND a.shift_id = s.id AND a.date = ?
        LEFT JOIN 
          leaves l ON e.id = l.employee_id AND ? BETWEEN l.start_date AND l.end_date
        WHERE 
          e.organization_id = ? AND e.status = 'active' AND e.joining_date <= ?
      `;

      const filters = [];
      const params = [selectedDate, selectedDate, organizationId, selectedDate];

      if (departmentId) {
        filters.push('e.department_id = ?');
        params.push(departmentId);
      }

      if (designationId) {
        filters.push('e.designation_id = ?');
        params.push(designationId);
      }

      if (employeeName) {
        filters.push('(e.first_name LIKE ? OR e.last_name LIKE ?)');
        params.push(`%${employeeName}%`, `%${employeeName}%`);
      }

      if (status && status !== 'not_set') {
        filters.push(`IFNULL(a.status, CASE WHEN l.id IS NOT NULL THEN 'Leave' ELSE 'Not Set' END) = ?`);
        params.push(status);
      }

      const finalWhereClause = filters.length > 0 ? ` AND ${filters.join(' AND ')}` : '';

      const selectQuery = `
        SELECT 
          e.id AS employee_id,
          e.first_name,
          e.last_name,
          e.email,
          IFNULL(a.status, 
              CASE 
                  WHEN l.id IS NOT NULL THEN 'Leave' 
                  ELSE 'Not Set' 
              END
          ) AS attendance_status,
          s.name AS shift_name,
          a.check_in,
          a.check_out,
          a.work_hours,
          a.approval_status
        ${baseQuery} ${finalWhereClause}
        ORDER BY e.first_name ASC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        ${baseQuery} ${finalWhereClause}
      `;

      const countParams = [...params];
      const dataParams = [...params, limit, offset];

      const [[{ total }]] = await pool.query(countQuery, countParams);
      const [rows] = await pool.query(selectQuery, dataParams);

      return {
        data: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAttendanceList:', error);
      throw error;
    }
  }
}
export default Attendance;