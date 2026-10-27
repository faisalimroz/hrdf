/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  console.error('[Error Caught]:', err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({
      success: false,
      error: message,
    });
  }

  // Mongoose Duplicate Key (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate field value entered for '${field}'. Please use another value.`;
    return res.status(400).json({
      success: false,
      error: message,
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
      details: messages,
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication token has expired',
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  return res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
