const Joi = require("joi");

const verificationCodeValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  verificationCode: Joi.string().length(6).optional().messages({
    "string.length": "Verification code must be 6 characters",
  }),
  expiresIn: Joi.date().optional(),
});

module.exports = verificationCodeValidation;
