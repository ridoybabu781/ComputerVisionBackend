const Joi = require("joi");

const registerValidation = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  verificationCode: Joi.string().optional(),
});

const updateProfileValidation = Joi.object({
  name: Joi.string().min(3).required(),
  birthDate: Joi.date().optional(),
  age: Joi.number().optional(),
  gender: Joi.string().optional(),
  address: Joi.string().optional(),
  phone: Joi.string().optional(),
});

const updateProfilePicValidation = Joi.object({
  originalname: Joi.string().required(),
  mimetype: Joi.string().valid("image/jpeg", "image/png").required(),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required(),
});

module.exports = {
  registerValidation,
  updateProfileValidation,
  updateProfilePicValidation,
};
