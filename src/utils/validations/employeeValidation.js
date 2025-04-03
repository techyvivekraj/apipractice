import { body, query, param } from 'express-validator';
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '../../config/fileUpload.js';

const validationRules = {
  addEmployee: [
    // Required fields
    body('firstName')
      .notEmpty().withMessage('First Name is required')
      .trim()
      .isLength({ max: 50 }).withMessage('First Name must be less than 50 characters'),

    body('lastName')
      .notEmpty().withMessage('Last Name is required')
      .trim()
      .isLength({ max: 50 }).withMessage('Last Name must be less than 50 characters'),

    body('phone')
      .notEmpty().withMessage('Phone is required')
      .matches(/^[0-9+\s-()]{10,}$/).withMessage('Invalid phone number format'),

    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),

    body('joiningDate')
      .notEmpty().withMessage('Joining Date is required')
      .isISO8601().withMessage('Invalid date format'),

    body('departmentId')
    .optional().trim()
      .isInt().withMessage('Invalid Department ID'),

    body('designationId')
    .optional().trim()
      .isInt().withMessage('Invalid Designation ID'),

    body('shiftId')
    .optional().trim()
      .isInt().withMessage('Invalid Shift ID'),

    body('salaryType')
      .notEmpty().withMessage('Salary Type is required')
      .isIn(['monthly', 'daily', 'hourly']).withMessage('Invalid Salary Type'),

    body('salary')
      .notEmpty().withMessage('Salary Amount is required')
      .isFloat({ min: 0 }).withMessage('Salary must be a positive number'),

    body('organizationId')
      .notEmpty().withMessage('Organization ID is required')
      .isInt().withMessage('Invalid Organization ID'),

    // Optional fields
    body('middleName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Middle Name must be less than 50 characters'),

    body('emergencyName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Emergency Contact Name must be less than 50 characters'),

    body('emergencyContact')
      .optional()
      .matches(/^[0-9+\s-()]{10,}$/).withMessage('Invalid emergency contact number format'),

    body('employeeCode')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Employee Code must be less than 50 characters'),

    body('address')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Address must be less than 255 characters'),

    body('country')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Country must be less than 50 characters'),

    body('state')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('State must be less than 50 characters'),

    body('postalCode')
      .optional()
      .trim()
      .isLength({ max: 20 }).withMessage('Postal Code must be less than 20 characters'),

    body('dateOfBirth')
      .optional()
      .isISO8601().withMessage('Invalid Date of Birth format'),

    body('gender')
      .optional()
      .isIn(['male', 'female', 'other']).withMessage('Invalid Gender'),

    body('bloodGroup')
      .optional()
      .trim()
      .isLength({ max: 5 }).withMessage('Blood Group must be less than 5 characters'),

    body('bankAccountNumber')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Bank Account Number must be less than 100 characters'),

    body('bankIfsc')
      .optional()
      .trim()
      .isLength({ max: 20 }).withMessage('Bank IFSC must be less than 20 characters'),

    body('bankName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Bank Name must be less than 100 characters'),

    body('reportingManagerId')
      .optional()
      .trim()
      .isInt().withMessage('Invalid Reporting manager ID'),

    // File validations
    body('educationalDocs.*')
      .optional()
      .custom((value, { req }) => {
        if (req.files && req.files.educationalDocs) {
          for (const file of req.files.educationalDocs) {
            if (file.size > MAX_FILE_SIZE) {
              throw new Error('File size must not exceed 5MB');
            }
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
              throw new Error('Invalid file type');
            }
          }
        }
        return true;
      }),

    body('professionalDocs.*')
      .optional()
      .custom((value, { req }) => {
        if (req.files && req.files.professionalDocs) {
          for (const file of req.files.professionalDocs) {
            if (file.size > MAX_FILE_SIZE) {
              throw new Error('File size must not exceed 5MB');
            }
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
              throw new Error('Invalid file type');
            }
          }
        }
        return true;
      }),

    body('identityDocs.*')
      .optional()
      .custom((value, { req }) => {
        if (req.files && req.files.identityDocs) {
          for (const file of req.files.identityDocs) {
            if (file.size > MAX_FILE_SIZE) {
              throw new Error('File size must not exceed 5MB');
            }
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
              throw new Error('Invalid file type');
            }
          }
        }
        return true;
      }),

    body('addressDocs.*')
      .optional()
      .custom((value, { req }) => {
        if (req.files && req.files.addressDocs) {
          for (const file of req.files.addressDocs) {
            if (file.size > MAX_FILE_SIZE) {
              throw new Error('File size must not exceed 5MB');
            }
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
              throw new Error('Invalid file type');
            }
          }
        }
        return true;
      }),

    body('otherDocs.*')
      .optional()
      .custom((value, { req }) => {
        if (req.files && req.files.otherDocs) {
          for (const file of req.files.otherDocs) {
            if (file.size > MAX_FILE_SIZE) {
              throw new Error('File size must not exceed 5MB');
            }
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
              throw new Error('Invalid file type');
            }
          }
        }
        return true;
      })
  ],

  updateEmployee: [
    param('id')
      .isInt().withMessage('Invalid employee ID'),

    query('organizationId')
      .notEmpty().withMessage('Organization ID is required')
      .isInt().withMessage('Invalid Organization ID'),

    // Optional fields with same validation as addEmployee
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('First Name must be less than 50 characters'),

    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Last Name must be less than 50 characters'),

    body('phone')
      .optional()
      .matches(/^[0-9+\s-()]{10,}$/).withMessage('Invalid phone number format'),

    body('email')
      .optional()
      .isEmail().withMessage('Invalid email format'),

    body('joiningDate')
      .optional()
      .isISO8601().withMessage('Invalid date format'),

    body('departmentId')
      .optional()
      .isInt().withMessage('Invalid Department ID'),

    body('designationId')
      .optional()
      .isInt().withMessage('Invalid Designation ID'),

    body('shiftId')
      .optional()
      .isInt().withMessage('Invalid Shift ID'),

    body('salaryType')
      .optional()
      .isIn(['monthly', 'daily', 'hourly']).withMessage('Invalid Salary Type'),

    body('salary')
      .optional()
      .isFloat({ min: 0 }).withMessage('Salary must be a positive number'),

    body('middleName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Middle Name must be less than 50 characters'),

    body('employeeCode')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Employee Code must be less than 50 characters'),

    body('address')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Address must be less than 255 characters'),

    body('country')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Country must be less than 50 characters'),

    body('state')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('State must be less than 50 characters'),

    body('postalCode')
      .optional()
      .trim()
      .isLength({ max: 20 }).withMessage('Postal Code must be less than 20 characters'),

    body('dateOfBirth')
      .optional()
      .isISO8601().withMessage('Invalid Date of Birth format'),

    body('gender')
      .optional()
      .isIn(['male', 'female', 'other']).withMessage('Invalid Gender'),

    body('bloodGroup')
      .optional()
      .trim()
      .isLength({ max: 5 }).withMessage('Blood Group must be less than 5 characters'),

    body('bankAccountNumber')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Bank Account Number must be less than 100 characters'),

    body('bankIfsc')
      .optional()
      .trim()
      .isLength({ max: 20 }).withMessage('Bank IFSC must be less than 20 characters'),

    body('bankName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Bank Name must be less than 100 characters'),

    body('emergencyName')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Emergency Contact Name must be less than 50 characters'),

    body('emergencyContact')
      .optional()
      .matches(/^[0-9+\s-()]{10,}$/).withMessage('Invalid emergency contact number format')
  ],

  getEmployee: [
    param('id')
      .isInt().withMessage('Invalid employee ID'),

    query('organizationId')
      .notEmpty().withMessage('Organization ID is required')
      .isInt().withMessage('Invalid Organization ID')
  ],

  getEmployees: [
    query('organizationId')
      .notEmpty().withMessage('Organization ID is required')
      .isInt().withMessage('Invalid Organization ID'),

    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  deleteEmployee: [
    param('id')
      .isInt().withMessage('Invalid employee ID'),

    query('organizationId')
      .notEmpty().withMessage('Organization ID is required')
      .isInt().withMessage('Invalid Organization ID')
  ]
};

export default validationRules;
