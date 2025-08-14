const express = require("express");
const orderRouter = express.Router();
const User = require("../middlewares/User");
const {
  addOrder,
  cancelOrder,
  updateOrder,
} = require("../controllers/order.controller");
const validate = require("../middlewares/validate");
const orderValidator = require("../valitations/order.validate");

orderRouter.post("/createOrder", User, validate(orderValidator), addOrder);
orderRouter.put("/updateOrder", User, updateOrder);
orderRouter.post("/cancelOrder", User, cancelOrder);

module.exports = orderRouter;
