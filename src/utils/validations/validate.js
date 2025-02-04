import { validationResult } from 'express-validator';

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const uniqueErrors = new Map();
      
      errors.array().forEach(error => {
        if (!uniqueErrors.has(error.path)) {
          uniqueErrors.set(error.path, {
            type: 'validation',
            msg: error.msg,
            path: error.path,
            location: error.location
          });
        }
      });

      return res.status(400).json({
        success: false,
        statusCode: 400,
        errors: Array.from(uniqueErrors.values())
      });
    }

    next();
  };
};

export default validate;
