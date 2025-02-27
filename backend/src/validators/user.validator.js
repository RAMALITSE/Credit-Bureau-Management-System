// backend/src/validators/user.validator.js
const Joi = require('joi');
const { createError } = require('../utils/error');

// Validate user update input
exports.validateUserUpdate = (req, res, next) => {
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
    firstName: Joi.string().messages({
      'string.empty': 'First name cannot be empty'
    }),
    lastName: Joi.string().messages({
      'string.empty': 'Last name cannot be empty'
    }),
    phoneNumber: Joi.string().messages({
      'string.empty': 'Phone number cannot be empty'
    }),
    address: addressSchema,
    employmentInfo: employmentInfoSchema.optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate admin user update input
exports.validateAdminUserUpdate = (req, res, next) => {
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
    firstName: Joi.string().messages({
      'string.empty': 'First name cannot be empty'
    }),
    lastName: Joi.string().messages({
      'string.empty': 'Last name cannot be empty'
    }),
    email: Joi.string().email().messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Please provide a valid email'
    }),
    phoneNumber: Joi.string().messages({
      'string.empty': 'Phone number cannot be empty'
    }),
    userType: Joi.string().valid('consumer', 'lender', 'admin').messages({
      'string.empty': 'User type cannot be empty',
      'any.only': 'User type must be consumer, lender, or admin'
    }),
    address: addressSchema,
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