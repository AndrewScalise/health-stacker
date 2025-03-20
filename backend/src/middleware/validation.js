const { validationResult } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");

// Middleware to validate requests using express-validator
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const extractedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));

    return next(new ErrorResponse("Validation Error", 400, extractedErrors));
  };
};
