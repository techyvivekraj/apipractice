import { body } from 'express-validator';

const employeeValidationRules = [
  // Required Basic Information
  body('employeeCode')
    .notEmpty().withMessage('Employee code is required')
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

  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const age = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18) throw new Error('Employee must be at least 18 years old');
      return true;
    }),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Invalid gender'),

  // Optional Fields
  body('bloodGroup')
    .optional()
    .matches(/^(A|B|AB|O)[+-]$/).withMessage('Invalid blood group'),

  body('address').optional(),
  body('city').optional(),
  body('state').optional(),
  body('country').optional(),
  body('postalCode').optional(),

  body('emergencyContactName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Invalid emergency contact name'),

  body('emergencyContactPhone')
    .optional()
    .matches(/^\+?[\d\s-]{8,20}$/).withMessage('Invalid emergency contact phone format'),

  // Required Employment Information
  body('departmentId')
    .notEmpty().withMessage('Department ID is required')
    .isNumeric().withMessage('Department ID must be a number'),

  body('designationId')
    .notEmpty().withMessage('Designation ID is required')
    .isNumeric().withMessage('Designation ID must be a number'),

  body('joiningDate')
    .notEmpty().withMessage('Joining date is required')
    .isISO8601().withMessage('Joining date must be in YYYY-MM-DD format'),

  body('salaryType')
    .notEmpty().withMessage('Salary type is required')
    .isIn(['monthly', 'daily', 'hourly']).withMessage('Invalid salary type'),

  body('bankAccountNumber')
    .notEmpty().withMessage('Bank account number is required')
    .matches(/^\d{9,18}$/).withMessage('Invalid bank account number'),

  body('bankIfscCode')
    .notEmpty().withMessage('Bank IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code'),

  // Optional Employment Information
  body('reportingManagerId')
    .optional()
    .isNumeric().withMessage('Reporting manager ID must be a number'),

  body('projectManagerId')
    .optional()
    .isNumeric().withMessage('Project manager ID must be a number'),

  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Invalid status')
];

export default employeeValidationRules;
