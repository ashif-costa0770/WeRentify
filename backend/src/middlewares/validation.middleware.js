import { body, param, validationResult } from 'express-validator';

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("❌ VALIDATION ERRORS:", JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules for creating a listing
export const validateCreateListing = [
  body('itemName')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 100 }).withMessage('Item name cannot exceed 100 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  
  body('pickupLocation')
    .trim()
    .notEmpty().withMessage('Pickup location is required'),
  
  body('hourlyRate')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  
  body('dailyRate')
    .notEmpty().withMessage('Daily rate is required')
    .isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
  
  body('weeklyRate')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Weekly rate must be a positive number'),
  
  // Note: isAvailable and offerDelivery come as strings from FormData
  // The controller handles string-to-boolean conversion
  
  body('deliveryFee')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Delivery fee must be a positive number'),
  
  validate
];

// Validation rules for updating a listing
export const validateUpdateListing = [
  body('itemName')
    .optional()
    .trim()
    .notEmpty().withMessage('Item name cannot be empty')
    .isLength({ max: 100 }).withMessage('Item name cannot exceed 100 characters'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Description cannot be empty')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  
  body('pickupLocation')
    .optional()
    .trim()
    .notEmpty().withMessage('Pickup location cannot be empty'),
  
  body('hourlyRate')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  
  body('dailyRate')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Daily rate must be a positive number'),
  
  body('weeklyRate')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Weekly rate must be a positive number'),
  
  body('deliveryFee')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Delivery fee must be a positive number'),
  
  body('status')
    .optional({ values: 'falsy' })
    .isIn(['active', 'inactive', 'rented', 'under_maintenance'])
    .withMessage('Invalid status value'),
  
  validate
];

// Validation for MongoDB ObjectId
export const validateListingId = [
  param('id')
    .isMongoId().withMessage('Invalid listing ID'),
  
  validate
];