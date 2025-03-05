import { body, validationResult } from 'express-validator';

const validationRules = {
  register: [
    body('name')
      .notEmpty().withMessage('Name is required')
      .trim()
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    
    body('organizationName')
      .notEmpty().withMessage('Organization name is required')
      .trim()
      .isLength({ min: 2 }).withMessage('Organization name must be at least 2 characters'),
    
      body('mobile')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('If provided, mobile number must be in a valid format')
    
  ],
  
  login: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    
    body('password')
      .notEmpty().withMessage('Password is required')
  ]
};

// Middleware function that runs the validation
const validate = (validationType) => {
  return async (req, res, next) => {
    // Get the validation rules for the specified type
    const rules = validationRules[validationType];
    
    if (!rules) {
      return res.status(400).json({ 
        success: false,
        statusCode: 400,
        errors: [{
          type: 'validation',
          msg: `No validation rules found for ${validationType}`,
          path: validationType,
          location: 'body'
        }]
      });
    }

    // Run all validation rules
    await Promise.all(rules.map(validation => validation.run(req)));

    // Check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        errors: errors.array().map(error => ({
          type: 'validation',
          msg: error.msg,
          path: error.path,
          location: error.location
        }))
      });
    }

    next();
  };
};

export default validate;