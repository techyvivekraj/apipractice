const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack trace for debugging

  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      success: false,
      statusCode: 409,
      errors: [{
        type: 'conflict',
        msg: 'Duplicate entry detected.'
      }]
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false,
      statusCode: 400,
      errors: Object.keys(err.errors).map(key => ({
        type: 'validation',
        msg: err.errors[key].message,
        path: key,
        location: 'body'
      }))
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false,
      statusCode: 401,
      errors: [{
        type: 'auth',
        msg: 'Invalid or expired token.',
        path: 'authorization',
        location: 'header'
      }]
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      success: false,
      statusCode: 401,
      errors: [{
        type: 'auth',
        msg: 'Unauthorized access.',
        path: 'authorization',
        location: 'header'
      }]
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({ 
      success: false,
      statusCode: 404,
      errors: [{
        type: 'notFound',
        msg: err.message || 'Resource not found.',
        path: err.path || 'resource',
        location: err.location || 'params'
      }]
    });
  }

  // Handle database errors
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ 
      success: false,
      statusCode: 400,
      errors: [{
        type: 'database',
        msg: 'Invalid reference in database operation.',
        path: err.sqlMessage?.split("'")[1] || 'unknown',
        location: 'body'
      }]
    });
  }

  // Handle generic errors
  const errorMessage = process.env.NODE_ENV === 'development' ? 
    err.message : 
    'An internal server error occurred.';

  res.status(500).json({
    success: false,
    statusCode: 500,
    errors: [{
      type: 'server',
      msg: errorMessage,
      path: 'server',
      location: 'internal',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }]
  });
};

export default errorHandler;