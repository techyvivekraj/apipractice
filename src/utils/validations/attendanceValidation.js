import { body, param, query } from 'express-validator';

const attendanceValidationRules = {
  getAttendanceList: [
    query('startDate')
      .optional()
      .isISO8601().withMessage('Invalid start date format'),
    
    query('endDate')
      .optional()
      .isISO8601().withMessage('Invalid end date format'),
    
    query('employeeId')
      .optional()
      .isInt().withMessage('Invalid employee ID'),
    
    query('status')
      .optional()
      .isIn(['present', 'absent', 'half-day', 'late', 'leave'])
      .withMessage('Invalid status'),
    
    query('approvalStatus')
      .optional()
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Invalid approval status'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  markAttendance: [
    body('date')
      .notEmpty().withMessage('Date is required')
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) {
          throw new Error('Cannot mark attendance for future dates');
        }
        return true;
      }),

    body('checkInTime')
      .notEmpty().withMessage('Check-in time is required')
      .isISO8601().withMessage('Invalid datetime format'),

    body('checkInLocation')
      .notEmpty().withMessage('Location is required')
      .isObject().withMessage('Invalid location format')
      .custom((value) => {
        if (!value.latitude || !value.longitude) {
          throw new Error('Location must include latitude and longitude');
        }
        if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
          throw new Error('Latitude and longitude must be numbers');
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
      .notEmpty().withMessage('Photo is required')
      .isURL().withMessage('Invalid photo URL')
  ],

  markCheckOut: [
    param('id')
      .isInt().withMessage('Invalid attendance ID'),
    
    body('checkOutTime')
      .notEmpty().withMessage('Check-out time is required')
      .isISO8601().withMessage('Invalid datetime format')
      .custom((value, { req }) => {
        const checkOut = new Date(value);
        const today = new Date();
        
        if (checkOut > today) {
          throw new Error('Cannot mark check-out for future time');
        }
        return true;
      }),

    body('checkOutLocation')
      .notEmpty().withMessage('Location is required')
      .isObject().withMessage('Invalid location format')
      .custom((value) => {
        if (!value.latitude || !value.longitude) {
          throw new Error('Location must include latitude and longitude');
        }
        if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number') {
          throw new Error('Latitude and longitude must be numbers');
        }
        if (value.latitude < -90 || value.latitude > 90) {
          throw new Error('Invalid latitude value');
        }
        if (value.longitude < -180 || value.longitude > 180) {
          throw new Error('Invalid longitude value');
        }
        return true;
      }),

    body('checkOutPhoto')
      .notEmpty().withMessage('Photo is required')
      .isURL().withMessage('Invalid photo URL')
  ],

  updateApproval: [
    param('id')
      .isInt().withMessage('Invalid attendance ID'),
    
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be either approved or rejected'),
    
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .notEmpty().withMessage('Rejection reason is required when rejecting attendance')
      .isLength({ min: 10, max: 500 })
      .withMessage('Rejection reason must be between 10 and 500 characters')
  ]
};

export default attendanceValidationRules; 