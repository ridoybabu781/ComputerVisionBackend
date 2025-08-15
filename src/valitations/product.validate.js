const Joi = require("joi");

const productValidation = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Product title is required",
    "string.empty": "Product title cannot be empty",
  }),
  category: Joi.string().default("Other"),
  brand: Joi.string().required().messages({
    "any.required": "Brand is required",
    "string.empty": "Brand cannot be empty",
  }),
  model: Joi.string().allow("").optional(),
  description: Joi.string().allow("").required(),
  price: Joi.number().min(0).required().messages({
    "any.required": "Price is required",
    "number.min": "Price cannot be negative",
  }),
  discountPrice: Joi.number().min(0).optional(),
  specs: Joi.object({
    cpu: Joi.string().allow("").optional(),
    ram: Joi.string().allow("").optional(),
    storage: Joi.string().allow("").optional(),
    gpu: Joi.string().allow("").optional(),
    display: Joi.string().allow("").optional(),
    battery: Joi.string().allow("").optional(),
    os: Joi.string().allow("").optional(),
    ports: Joi.array().items(Joi.string()).optional(),
    others: Joi.string().allow("").optional(),
  }).optional(),
  images: Joi.object({
    productImages: Joi.array().items(Joi.string()).optional(),
    imagePublicIds: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  stock: Joi.number().min(0).default(0),
});

module.exports = productValidation;
