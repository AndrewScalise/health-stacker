/**
 * Custom error class for API responses
 * @extends Error
 */
class ErrorResponse extends Error {
  /**
   * Create a formatted error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Array|Object} details - Optional detailed error information
   */
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = ErrorResponse;
