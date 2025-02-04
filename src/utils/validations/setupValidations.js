import { body, param, query } from 'express-validator';

const validationRules = {
  // Department Validations
  createDepartment: [
    body('name')
      .notEmpty().withMessage('Department name is required')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s-_&]+$/).withMessage('Department name can only contain letters, numbers, spaces, and -_&'),
  ],

  updateDepartment: [
    param('id')
      .isInt().withMessage('Invalid department ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s-_&]+$/).withMessage('Department name can only contain letters, numbers, spaces, and -_&'),
  ],

  deleteDepartment: [
    param('id')
      .isInt().withMessage('Invalid department ID'),
  ],

  // Designation Validations
  createDesignation: [
    body('name')
      .notEmpty().withMessage('Designation name is required')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Designation name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s-_&]+$/).withMessage('Designation name can only contain letters, numbers, spaces, and -_&'),
    body('departmentId')
      .notEmpty().withMessage('Department ID is required')
      .isInt().withMessage('Invalid department ID')
      .custom(async (value, { req }) => {
        const [department] = await pool.query(
          'SELECT id FROM departments WHERE id = ? AND organization_id = ?',
          [value, req.user.organizationId]
        );
        if (!department.length) {
          throw new Error('Department not found in your organization');
        }
        return true;
      }),
  ],

  updateDesignation: [
    param('id')
      .isInt().withMessage('Invalid designation ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Designation name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s-_&]+$/).withMessage('Designation name can only contain letters, numbers, spaces, and -_&'),
    body('departmentId')
      .optional()
      .isInt().withMessage('Invalid department ID'),
  ],

  deleteDesignation: [
    param('id')
      .isInt().withMessage('Invalid designation ID'),
  ],

  // Shift Validations
  createShift: [
    body('name')
      .notEmpty().withMessage('Shift name is required')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Shift name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9\s-_]+$/).withMessage('Shift name can only contain letters, numbers, spaces, and -_'),
    body('startTime')
      .notEmpty().withMessage('Start time is required')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
    body('endTime')
      .notEmpty().withMessage('End time is required')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format')
      .custom((value, { req }) => {
        if (value <= req.body.startTime) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    body('workingDays')
      .notEmpty().withMessage('Working days are required')
      .isString().withMessage('Working days must be a string')
      .matches(/^[A-Za-z,]+$/).withMessage('Working days must be comma-separated day names')
      .custom((value) => {
        const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const days = value.split(',');
        if (!days.every(day => validDays.includes(day))) {
          throw new Error('Invalid day format. Use Mon,Tue,Wed,Thu,Fri,Sat,Sun');
        }
        return true;
      }),
  ],

  updateShift: [
    param('id')
      .isInt().withMessage('Invalid shift ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Shift name must be between 2 and 50 characters'),
    body('startTime')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
    body('endTime')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format')
      .custom((value, { req }) => {
        if (value && req.body.startTime && value <= req.body.startTime) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
  ],

  deleteShift: [
    param('id')
      .isInt().withMessage('Invalid shift ID'),
  ],

  // Shift Assignment Validations
  assignShift: [
    body('employeeId')
      .notEmpty().withMessage('Employee ID is required')
      .isInt().withMessage('Invalid employee ID')
      .custom(async (value, { req }) => {
        const [employee] = await pool.query(
          'SELECT id FROM employees WHERE id = ? AND organization_id = ?',
          [value, req.user.organizationId]
        );
        if (!employee.length) {
          throw new Error('Employee not found in your organization');
        }
        return true;
      }),
    body('shiftId')
      .notEmpty().withMessage('Shift ID is required')
      .isInt().withMessage('Invalid shift ID'),
    body('startDate')
      .notEmpty().withMessage('Start date is required')
      .isDate().withMessage('Invalid start date format')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Start date cannot be in the past');
        }
        return true;
      }),
    body('endDate')
      .notEmpty().withMessage('End date is required')
      .isDate().withMessage('Invalid end date format')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
  ],

  removeShiftAssignment: [
    param('id')
      .isInt().withMessage('Invalid shift assignment ID'),
  ],

  // Common Validations
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],

  checkSetupStatus: [
    body('organizationId')
      .notEmpty().withMessage('Organization ID is required')
      .isInt().withMessage('Invalid organization ID')
      .custom((value, { req }) => {
        if (parseInt(value) !== req.user.organizationId) {
          throw new Error('Organization ID mismatch with authenticated user');
        }
        return true;
      }),
  ],

  holidayValidations: {
    createHoliday: [
      body('name')
        .notEmpty().withMessage('Holiday name is required')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Holiday name must be between 2 and 100 characters'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
      
      body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
      
      body('type')
        .optional()
        .isIn(['full', 'half']).withMessage('Type must be either full or half'),
      
      body('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
    ],

    updateHoliday: [
      param('id')
        .isInt().withMessage('Invalid holiday ID'),
      
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Holiday name must be between 2 and 100 characters'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
      
      body('date')
        .optional()
        .isISO8601().withMessage('Invalid date format'),
      
      body('type')
        .optional()
        .isIn(['full', 'half']).withMessage('Type must be either full or half'),
      
      body('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
    ]
  },
};

export default validationRules;
