const express = require("express");
const orderRouter = express.Router();
const User = require("../middlewares/User");
const {
  addOrder,
  cancelOrder,
  updateOrder,
} = require("../controllers/order.controller");

orderRouter.post("/createOrder", User, addOrder);
orderRouter.put("/updateOrder", User, updateOrder);
orderRouter.post("/cancelOrder", User, cancelOrder);

module.exports = orderRouter;
