// backend/src/validators/dispute.validator.js
const Joi = require('joi');
const { createError } = require('../utils/error');

// Affected item schema
const affectedItemSchema = Joi.object({
  field: Joi.string().required().messages({
    'string.empty': 'Field name is required',
    'any.required': 'Field name is required'
  }),
  currentValue: Joi.required().messages({
    'any.required': 'Current value is required'
  }),
  claimedValue: Joi.required().messages({
    'any.required': 'Claimed value is required'
  }),
  resolved: Joi.boolean().default(false)
});

// Validate dispute creation
exports.validateDisputeCreate = (req, res, next) => {
  const schema = Joi.object({
    accountId: Joi.string().required().messages({
      'string.empty': 'Account ID is required',
      'any.required': 'Account ID is required'
    }),
    disputeReason: Joi.string()
      .valid('not_mine', 'incorrect_amount', 'paid_debt', 'incorrect_status', 'duplicate_account', 'other')
      .required()
      .messages({
        'string.empty': 'Dispute reason is required',
        'any.required': 'Dispute reason is required',
        'any.only': 'Dispute reason must be one of: not_mine, incorrect_amount, paid_debt, incorrect_status, duplicate_account, other'
      }),
    description: Joi.string().required().min(10).messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'any.required': 'Description is required'
    }),
    supportingDocuments: Joi.array().items(Joi.string()).default([]),
    affectedItems: Joi.array().items(affectedItemSchema).min(1).required().messages({
      'array.min': 'At least one affected item is required',
      'any.required': 'Affected items are required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate dispute update
exports.validateDisputeUpdate = (req, res, next) => {
  const schema = Joi.object({
    description: Joi.string().min(10).messages({
      'string.min': 'Description must be at least 10 characters long'
    }),
    supportingDocuments: Joi.array().items(Joi.string()),
    affectedItems: Joi.array().items(affectedItemSchema).min(1).messages({
      'array.min': 'At least one affected item is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate lender response
exports.validateLenderResponse = (req, res, next) => {
  const schema = Joi.object({
    response: Joi.string().required().min(10).messages({
      'string.empty': 'Response is required',
      'string.min': 'Response must be at least 10 characters long',
      'any.required': 'Response is required'
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};

// Validate admin resolution
exports.validateDisputeResolution = (req, res, next) => {
  const schema = Joi.object({
    resolution: Joi.string().required().min(10).messages({
      'string.empty': 'Resolution is required',
      'string.min': 'Resolution must be at least 10 characters long',
      'any.required': 'Resolution is required'
    }),
    status: Joi.string()
      .valid('resolved', 'rejected')
      .required()
      .messages({
        'string.empty': 'Status is required',
        'any.required': 'Status is required',
        'any.only': 'Status must be either resolved or rejected'
      }),
    affectedItems: Joi.array().items(
      Joi.object({
        field: Joi.string().required(),
        currentValue: Joi.required(),
        claimedValue: Joi.required(),
        resolved: Joi.boolean().required()
      })
    )
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};