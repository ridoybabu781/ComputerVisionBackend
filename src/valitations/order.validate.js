const Joi = require("joi");

const orderValidator = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),

  orderItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required().messages({
          "any.required": "Product ID is required",
          "string.empty": "Product ID cannot be empty",
        }),
        qty: Joi.number().required().messages({
          "any.required": "Quantity is required",
        }),
        price: Joi.number().required().messages({
          "any.required": "Price is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({ "any.required": "Order items are required" }),

  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),

  paymentMethod: Joi.string()
    .valid("COD", "Bkash", "Nagad", "SSLCommerz", "Stripe", "PayPal")
    .required()
    .messages({
      "any.only": "Invalid payment method",
      "any.required": "Payment method is required",
    }),
  itemsPrice: Joi.number().min(0).required(),
  shippingPrice: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
});

module.exports = orderValidator;
