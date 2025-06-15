const { validationResult, body } = require('express-validator');

// Middleware to run validation and handle errors
exports.validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Example validation rules
exports.registerValidation = [
  body('username').isString().notEmpty(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['Admin', 'Manager', 'Clerk']),
];

exports.productValidation = [
  body('name').isString().notEmpty(),
  body('category').isString().notEmpty(),
  body('supplierId').isString().notEmpty(),
  body('quantity').isInt({ min: 0 }),
  body('threshold').isInt({ min: 0 }),
]; 