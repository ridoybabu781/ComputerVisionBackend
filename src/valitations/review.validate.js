const Joi = require("joi");
const mongoose = require("mongoose");

const reviewValidation = Joi.object({
  userId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid userId");
      }
      return value;
    }),
  productId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid productId");
      }
      return value;
    }),
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().trim().min(3).max(1000).required(),
  images: Joi.object({
    imageLinks: Joi.array().items(Joi.string().uri()).optional(),
    publicIds: Joi.array().items(Joi.string()).optional(),
  }).optional(),
});

module.exports = reviewValidation;
