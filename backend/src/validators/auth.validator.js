// backend/src/validators/auth.validator.js
const Joi = require('joi');
const { createError } = require('../utils/error');

// Validate registration input
exports.validateRegistration = (req, res, next) => {
  const addressSchema = Joi.object({
    street: Joi.string().required().messages({
      'string.empty': 'Street address is required',
      'any.required': 'Street address is required'
    }),
    city: Joi.string().required().messages({
      'string.empty': 'City is required',
      'any.required': 'City is required'
    }),
    state: Joi.string().required().messages({
      'string.empty': 'State is required',
      'any.required': 'State is required'
    }),
    postalCode: Joi.string().required().messages({
      'string.empty': 'Postal code is required',
      'any.required': 'Postal code is required'
    }),
    country: Joi.string().default('Lesotho')
  });

  const employmentInfoSchema = Joi.object({
    employer: Joi.string().required().messages({
      'string.empty': 'Employer name is required',
      'any.required': 'Employer name is required'
    }),
    position: Joi.string().required().messages({
      'string.empty': 'Position is required',
      'any.required': 'Position is required'
    }),
    yearEmployed: Joi.number().integer().required().messages({
      'number.base': 'Year employed must be a number',
      'any.required': 'Year employed is required'
    }),
    monthlyIncome: Joi.number().positive().required().messages({
      'number.base': 'Monthly income must be a number',
      'number.positive': 'Monthly income must be a positive number',
      'any.required': 'Monthly income is required'
    })
  });

  const schema = Joi.object({
    userType: Joi.string().valid('consumer', 'lender', 'admin').required().messages({
      'string.empty': 'User type is required',
      'any.only': 'User type must be consumer, lender, or admin',
      'any.required': 'User type is required'
    }),
    firstName: Joi.string().required().messages({
      'string.empty': 'First name is required',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'string.empty': 'Last name is required',
      'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
    phoneNumber: Joi.string().required().messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
    dateOfBirth: Joi.date().iso().required().messages({
      'date.base': 'Date of birth must be a valid date',
      'any.required': 'Date of birth is required'
    }),
    nationalId: Joi.string().required().messages({
      'string.empty': 'National ID is required',
      'any.required': 'National ID is required'
    }),
    address: addressSchema.required(),
    employmentInfo: Joi.when('userType', {
      is: 'consumer',
      then: employmentInfoSchema.required(),
      otherwise: Joi.optional()
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate login input
exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate password change input
exports.validatePasswordChange = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 8 characters long',
      'any.required': 'New password is required'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'string.empty': 'Confirm password is required',
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required'
    })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};