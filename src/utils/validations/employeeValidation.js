import { body } from 'express-validator';

const employeeValidationRules = [
  // Required Basic Information
  body('employeeCode')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Employee code must be between 2 and 50 characters'),

  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),

  body('middleName')
    .optional()
    .isLength({ max: 50 }).withMessage('Middle name must not exceed 50 characters'),

  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[\d\s-]{8,20}$/).withMessage('Invalid phone number format'),

  // Required Employment Information
  body('joiningDate')
    .notEmpty().withMessage('Joining date is required')
    .isISO8601().toDate().withMessage('Joining date must be in YYYY-MM-DD format'),

  body('departmentId')
    .notEmpty().withMessage('Department ID is required')
    .isNumeric().withMessage('Department ID must be a number')
    .toInt(),

  body('designationId')
    .notEmpty().withMessage('Designation ID is required')
    .isNumeric().withMessage('Designation ID must be a number')
    .toInt(),

  body('shiftId')
    .notEmpty().withMessage('Shift ID is required')
    .isNumeric().withMessage('Shift ID must be a number')
    .toInt(),

  body('salaryType')
    .notEmpty().withMessage('Salary type is required')
    .isIn(['monthly', 'daily', 'hourly']).withMessage('Invalid salary type'),

  body('salary')
    .notEmpty().withMessage('Salary amount is required')
    .isNumeric().withMessage('Salary must be a number')
    .toFloat()
    .custom(value => {
      if (value <= 0) throw new Error('Salary must be greater than zero');
      return true;
    }),

  // Optional Personal Information
  body('dateOfBirth')
    .optional()
    .isISO8601().toDate().withMessage('Invalid date format')
    .custom((value) => {
      if (value) {
        const age = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) throw new Error('Employee must be at least 18 years old');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']).withMessage('Invalid gender'),

  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood group'),

  // Optional Address Information
  body('address').optional(),
  body('city').optional(),
  body('state').optional(),
  body('country').optional(),
  body('postalCode').optional(),

  // Optional Emergency Contact Information
  body('emergencyContactName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Invalid emergency contact name'),

  body('emergencyContactPhone')
    .optional()
    .matches(/^\+?[\d\s-]{8,20}$/).withMessage('Invalid emergency contact phone format'),

  // Optional Banking Information
  body('bankAccountNumber')
    .optional()
    .isLength({ min: 5, max: 100 }).withMessage('Invalid bank account number'),

  body('bankIfscCode')
    .optional()
    .isLength({ min: 5, max: 20 }).withMessage('Invalid IFSC code'),

  // Optional Management Information
  body('reportingManagerId')
    .optional()
    .isNumeric().withMessage('Reporting manager ID must be a number')
    .toInt(),

  body('projectManagerId')
    .optional()
    .isNumeric().withMessage('Project manager ID must be a number')
    .toInt(),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Invalid status'),

  // Documents
  body('documents')
    .optional()
    .isObject().withMessage('Documents must be an object'),

  body('documents.*.*.name')
    .optional()
    .isString().withMessage('Document name must be a string'),

  body('documents.*.*.size')
    .optional()
    .isNumeric().withMessage('Document size must be a number')
    .toInt()
    .custom(value => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (value > maxSize) throw new Error('Document size must not exceed 5MB');
      return true;
    }),

  body('documents.*.*.type')
    .optional()
    .isString().withMessage('Document type must be a string')
    .custom(value => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      if (!allowedTypes.includes(value)) throw new Error('Invalid document type');
      return true;
    })
];

export default employeeValidationRules;
