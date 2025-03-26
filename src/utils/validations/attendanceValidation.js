import { body, param, query } from 'express-validator';

const attendanceValidationRules = {
  getAttendanceList: [
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
    
    query('employeeId')
      .optional()
      .isInt().withMessage('Invalid employee ID'),
    
    query('departmentId')
      .optional()
      .isInt().withMessage('Invalid department ID'),
    
    query('designationId')
      .optional()
      .isInt().withMessage('Invalid designation ID'),
    
    query('employeeName')
      .optional()
      .trim()
      .isLength({ min: 1 }).withMessage('Employee name cannot be empty'),
    
    query('status')
      .optional()
      .isIn(['present', 'absent', 'half-day', 'late', 'leave'])
      .withMessage('Invalid status'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  markCheckIn: [
    body('employeeId')
      .notEmpty().withMessage('Employee ID is required')
      .isInt().withMessage('Invalid employee ID'),
    
    body('shiftId')
      .notEmpty().withMessage('Shift ID is required')
      .isInt().withMessage('Invalid shift ID'),
    
    body('date')
      .notEmpty().withMessage('Date is required')
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        if (date.toDateString() !== today.toDateString()) {
          throw new Error('Check-in can only be marked for today');
        }
        return true;
      }),
    
    body('checkInTime')
      .notEmpty().withMessage('Check-in time is required')
      .isISO8601().withMessage('Invalid datetime format'),
    
    body('checkInLocation')
      .notEmpty().withMessage('Check-in location is required')
      .isObject().withMessage('Invalid location format')
      .custom((value) => {
        if (!value.latitude || !value.longitude) {
          throw new Error('Location must include latitude and longitude');
        }
        if (value.latitude < -90 || value.latitude > 90) {
          throw new Error('Invalid latitude value');
        }
        if (value.longitude < -180 || value.longitude > 180) {
          throw new Error('Invalid longitude value');
        }
        return true;
      }),
    
    body('checkInPhoto')
      .notEmpty().withMessage('Check-in photo is required')
      .isString().withMessage('Invalid photo path')
  ],

  markCheckOut: [
    param('id')
      .isInt().withMessage('Invalid attendance ID'),
    
    body('checkOutTime')
      .notEmpty().withMessage('Check-out time is required')
      .isISO8601().withMessage('Invalid datetime format'),
    
    body('checkOutLocation')
      .notEmpty().withMessage('Check-out location is required')
      .isObject().withMessage('Invalid location format')
      .custom((value) => {
        if (!value.latitude || !value.longitude) {
          throw new Error('Location must include latitude and longitude');
        }
        return true;
      }),
    
    body('checkOutPhoto')
      .notEmpty().withMessage('Check-out photo is required')
      .isString().withMessage('Invalid photo path')
  ],

  updateApprovalStatus: [
    param('id')
      .isInt().withMessage('Invalid attendance ID'),
    
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be either approved or rejected'),
    
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .notEmpty().withMessage('Rejection reason is required when rejecting attendance')
      .isString().withMessage('Invalid rejection reason')
      .isLength({ max: 500 })
      .withMessage('Rejection reason must not exceed 500 characters')
  ],

  markAttendance: [
    body('status')
      .optional()
      .isIn(['not set', 'pending', 'present', 'absent', 'half-day', 'late'])
      .withMessage('Invalid status value')
      .default('not set'),
  ],

  updateStatus: [
    body('status')
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Invalid status value'),
  ],

  editAttendance: [
    param('id')
      .isInt().withMessage('Invalid attendance ID'),
    
    body('checkInTime')
      .optional()
      .isISO8601().withMessage('Invalid check-in time format'),
    
    body('checkOutTime')
      .optional()
      .isISO8601().withMessage('Invalid check-out time format')
      .custom((value, { req }) => {
        if (value && req.body.checkInTime) {
          const checkIn = new Date(req.body.checkInTime);
          const checkOut = new Date(value);
          if (checkOut < checkIn) {
            throw new Error('Check-out time must be after check-in time');
          }
        }
        return true;
      }),
    
    body('status')
      .optional()
      .isIn(['present', 'absent', 'half-day', 'late'])
      .withMessage('Invalid status value'),
    
    body('remarks')
      .optional()
      .isString().withMessage('Invalid remarks')
      .isLength({ max: 500 })
      .withMessage('Remarks must not exceed 500 characters')
  ]
};

export default attendanceValidationRules; 