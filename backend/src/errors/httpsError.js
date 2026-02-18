/**
 * Custom HTTP error with status code and error code.
 * @extends Error
 */
class HttpError extends Error {
  /**
   * @param {number} status - HTTP status code.
   * @param {string} message - Error message.
   * @param {string} code - Application error code.
   */
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = { HttpError };
