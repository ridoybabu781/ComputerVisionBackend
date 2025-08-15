const Joi = require("joi");

const registerValidation = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  verificationCode: Joi.number().required().min(6),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "admin").default("user"),
});

const updateProfileValidation = Joi.object({
  name: Joi.string().min(3).optional(),
  birthDate: Joi.date().optional(),
  age: Joi.number().optional(),
  gender: Joi.string().optional(),
  address: Joi.string().optional(),
  phone: Joi.number().optional(),
  profilePic: Joi.string().uri().optional(),
});

const updateProfilePicValidation = Joi.object({
  originalname: Joi.string().required(),
  mimetype: Joi.string().required(),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required(),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerValidation,
  updateProfileValidation,
  updateProfilePicValidation,
};
