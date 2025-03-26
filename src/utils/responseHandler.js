export const handleResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data
  });
};

export const handleError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors || [{
      type: 'error',
      msg: message,
      path: 'server',
      location: 'internal'
    }]
  });
}; 