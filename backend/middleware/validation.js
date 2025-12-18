const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['influencer', 'company'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// Very basic validation for influencer creation
const influencerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('platform').notEmpty().withMessage('Platform is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('followers_count').optional().isInt({ min: 0 }).withMessage('Followers count must be a positive number')
];

// Very relaxed validation for updates
const influencerUpdateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('platform').optional().notEmpty().withMessage('Platform cannot be empty'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('followers_count').optional().isInt({ min: 0 }).withMessage('Followers count must be a positive number')
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  influencerValidation,
  influencerUpdateValidation
};