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
    
    query('departmentId')
      .optional()
      .isInt().withMessage('Invalid department ID'),
    
    query('designationId')
      .optional()
      .isInt().withMessage('Invalid designation ID'),
    
    query('employeeName')
      .optional(),
    
    query('status')
      .optional(),
    
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
      .isISO8601().withMessage('Invalid date format'),
    
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
  ]
};

export default attendanceValidationRules; 