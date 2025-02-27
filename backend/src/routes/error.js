// backend/src/utils/error.js
/**
 * Create an error object with a specified message and status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} - Custom error object
 */
exports.createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    return error;
  };
  
  /**
   * Handle MongoDB duplicate key errors
   * @param {Error} err - Original error object
   * @returns {Error} - Formatted error object
   */
  exports.handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value}. Please use another value for ${field}.`;
    return exports.createError(message, 400);
  };
  
  /**
   * Handle MongoDB validation errors
   * @param {Error} err - Original error object
   * @returns {Error} - Formatted error object
   */
  exports.handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return exports.createError(message, 400);
  };
  
  /**
   * Handle JWT errors
   * @param {Error} err - Original error object
   * @returns {Error} - Formatted error object
   */
  exports.handleJWTError = () => 
    exports.createError('Invalid token. Please log in again.', 401);
  
  /**
   * Handle expired JWT errors
   * @param {Error} err - Original error object
   * @returns {Error} - Formatted error object
   */
  exports.handleJWTExpiredError = () => 
    exports.createError('Your token has expired. Please log in again.', 401);