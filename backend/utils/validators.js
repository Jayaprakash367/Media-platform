const { body, validationResult } = require('express-validator');

// User registration validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('fullName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .trim()
];

// User login validation - accept email or username (allow `email` or `identifier`)
const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email, username or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Post validation
const validatePost = [
  body('caption')
    .optional()
    .isLength({ max: 2200 })
    .withMessage('Caption cannot exceed 2200 characters'),
  
  body('location')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Location cannot exceed 50 characters')
];

// Comment validation
const validateComment = [
  body('text')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
    .trim()
];

// Profile update validation
const validateProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('bio')
    .optional()
    .isLength({ max: 150 })
    .withMessage('Bio cannot exceed 150 characters'),
  
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .trim()
];

// Message validation
const validateMessage = [
  body('text')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .trim()
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Custom validation functions
const isValidObjectId = (value) => {
  // Accept either Mongo-style hex ids or UUIDs
  return /^[0-9a-fA-F]{24}$/.test(value) || /^[0-9a-fA-F-]{36}$/.test(value);
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!isValidObjectId(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`
      });
    }
    next();
  };
};

const validateMongoId = (value) => isValidObjectId(value);

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePost,
  validateComment,
  validateProfileUpdate,
  validateMessage,
  handleValidationErrors,
  isValidObjectId,
  validateObjectId,
  validateMongoId
};