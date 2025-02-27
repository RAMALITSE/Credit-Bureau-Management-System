// backend/src/validators/account.validator.js
const Joi = require('joi');
const { createError } = require('../utils/error');

// Validate account creation
exports.validateAccountCreate = (req, res, next) => {
  const schema = Joi.object({
    profileId: Joi.string().required().messages({
      'string.empty': 'Profile ID is required',
      'any.required': 'Profile ID is required'
    }),
    accountType: Joi.string()
      .valid('loan', 'credit_card', 'mortgage', 'auto_loan', 'student_loan', 'utility')
      .required()
      .messages({
        'string.empty': 'Account type is required',
        'any.required': 'Account type is required',
        'any.only': 'Account type must be one of: loan, credit_card, mortgage, auto_loan, student_loan, utility'
      }),
    accountNumber: Joi.string().required().messages({
      'string.empty': 'Account number is required',
      'any.required': 'Account number is required'
    }),
    openDate: Joi.date().iso().required().messages({
      'date.base': 'Open date must be a valid date',
      'any.required': 'Open date is required'
    }),
    creditLimit: Joi.when('accountType', {
      is: 'credit_card',
      then: Joi.number().positive().required().messages({
        'number.base': 'Credit limit must be a number',
        'number.positive': 'Credit limit must be a positive number',
        'any.required': 'Credit limit is required for credit cards'
      }),
      otherwise: Joi.number().positive().optional()
    }),
    currentBalance: Joi.number().min(0).required().messages({
      'number.base': 'Current balance must be a number',
      'number.min': 'Current balance cannot be negative',
      'any.required': 'Current balance is required'
    }),
    originalAmount: Joi.when('accountType', {
      is: Joi.string().valid('loan', 'mortgage', 'auto_loan', 'student_loan'),
      then: Joi.number().positive().required().messages({
        'number.base': 'Original amount must be a number',
        'number.positive': 'Original amount must be a positive number',
        'any.required': 'Original amount is required for loans'
      }),
      otherwise: Joi.number().positive().optional()
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate payment addition
exports.validatePaymentAdd = (req, res, next) => {
  const schema = Joi.object({
    dueDate: Joi.date().iso().required().messages({
      'date.base': 'Due date must be a valid date',
      'any.required': 'Due date is required'
    }),
    amountDue: Joi.number().positive().required().messages({
      'number.base': 'Amount due must be a number',
      'number.positive': 'Amount due must be a positive number',
      'any.required': 'Amount due is required'
    }),
    amountPaid: Joi.number().min(0).required().messages({
      'number.base': 'Amount paid must be a number',
      'number.min': 'Amount paid cannot be negative',
      'any.required': 'Amount paid is required'
    }),
    datePaid: Joi.date().iso().required().messages({
      'date.base': 'Date paid must be a valid date',
      'any.required': 'Date paid is required'
    }),
    status: Joi.string()
      .valid('on_time', 'late_30', 'late_60', 'late_90', 'default')
      .required()
      .messages({
        'string.empty': 'Payment status is required',
        'any.required': 'Payment status is required',
        'any.only': 'Payment status must be one of: on_time, late_30, late_60, late_90, default'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate account update by lender
exports.validateAccountUpdate = (req, res, next) => {
  const schema = Joi.object({
    currentBalance: Joi.number().min(0).messages({
      'number.base': 'Current balance must be a number',
      'number.min': 'Current balance cannot be negative'
    }),
    creditLimit: Joi.number().positive().messages({
      'number.base': 'Credit limit must be a number',
      'number.positive': 'Credit limit must be a positive number'
    }),
    status: Joi.string()
      .valid('current', 'closed', 'delinquent', 'default', 'collection')
      .messages({
        'any.only': 'Status must be one of: current, closed, delinquent, default, collection'
      }),
    closeDate: Joi.date().iso().messages({
      'date.base': 'Close date must be a valid date'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate admin account update
exports.validateAdminAccountUpdate = (req, res, next) => {
  const schema = Joi.object({
    accountType: Joi.string()
      .valid('loan', 'credit_card', 'mortgage', 'auto_loan', 'student_loan', 'utility')
      .messages({
        'any.only': 'Account type must be one of: loan, credit_card, mortgage, auto_loan, student_loan, utility'
      }),
    lenderId: Joi.string(),
    lenderName: Joi.string(),
    accountNumber: Joi.string(),
    openDate: Joi.date().iso().messages({
      'date.base': 'Open date must be a valid date'
    }),
    closeDate: Joi.date().iso().messages({
      'date.base': 'Close date must be a valid date'
    }),
    creditLimit: Joi.number().positive().messages({
      'number.base': 'Credit limit must be a number',
      'number.positive': 'Credit limit must be a positive number'
    }),
    currentBalance: Joi.number().min(0).messages({
      'number.base': 'Current balance must be a number',
      'number.min': 'Current balance cannot be negative'
    }),
    originalAmount: Joi.number().positive().messages({
      'number.base': 'Original amount must be a number',
      'number.positive': 'Original amount must be a positive number'
    }),
    status: Joi.string()
      .valid('current', 'closed', 'delinquent', 'default', 'collection')
      .messages({
        'any.only': 'Status must be one of: current, closed, delinquent, default, collection'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};