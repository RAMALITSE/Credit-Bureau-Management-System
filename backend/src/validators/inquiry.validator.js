// backend/src/validators/inquiry.validator.js
const Joi = require('joi');
const { createError } = require('../utils/error');

// Validate inquiry creation
exports.validateInquiryCreate = (req, res, next) => {
  const schema = Joi.object({
    profileId: Joi.string().required().messages({
      'string.empty': 'Profile ID is required',
      'any.required': 'Profile ID is required'
    }),
    inquiryType: Joi.string()
      .valid('hard', 'soft')
      .required()
      .messages({
        'string.empty': 'Inquiry type is required',
        'any.required': 'Inquiry type is required',
        'any.only': 'Inquiry type must be either hard or soft'
      }),
    inquiryPurpose: Joi.string()
      .valid('new_credit', 'credit_review', 'account_review', 'employment', 'insurance', 'prequalification')
      .required()
      .messages({
        'string.empty': 'Inquiry purpose is required',
        'any.required': 'Inquiry purpose is required',
        'any.only': 'Inquiry purpose must be one of: new_credit, credit_review, account_review, employment, insurance, prequalification'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(createError(errorMessage, 400));
  }

  next();
};