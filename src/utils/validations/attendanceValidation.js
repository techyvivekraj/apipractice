import { query } from 'express-validator';

const attendanceValidationRules = {
  getAttendanceList: [
    query('date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),

  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .custom((endDate, { req }) => {
      if (endDate && req.query.startDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        if (end < start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  query('departmentId')
    .optional()
    .isInt().withMessage('Invalid department ID'),

  query('designationId')
    .optional()
    .isInt().withMessage('Invalid designation ID'),

  query('employeeName')
    .optional()
    .trim()
    .notEmpty().withMessage('Employee name cannot be empty'),

  query('status')
    .optional()
    .isIn(['Present', 'Absent', 'Half-Day', 'Late', 'Leave', 'Not Set'])
    .withMessage('Invalid status'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100') 
  ],

};

export default attendanceValidationRules; 