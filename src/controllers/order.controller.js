const Order = require("../models/order.model");
const User = require("../models/user.model");
const createHttpError = require("http-errors");
const config = require("../config");
const qs = require("qs");
const {
  handleSSLCommerzPayment,
  handleCODPayment,
} = require("./payment.controller");

const addOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return next(createHttpError(401, "Unauthorized"));

    const user = await User.findById(userId);
    if (!user) return next(createHttpError(404, "User Not Found"));

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(createHttpError(400, "Order items are required"));
    }

    let allOrderItems = [];

    try {
      const parseItems =
        typeof orderItems === "string" ? JSON.parse(orderItems) : orderItems;

      allOrderItems = parseItems.map((item) => ({
        product: item.productId || item._id,
        qty: item.qty,
        price: item.price,
      }));
    } catch (error) {
      return next(createHttpError(400, "Invalid order items format"));
    }

    let address = {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    };

    const order = await Order.create({
      user: userId,
      orderItems: allOrderItems,
      shippingAddress: address,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      status: "Pending",
    });

    if (!order) {
      return next(createHttpError(400, "Order Creation Failed"));
    }

    res.status(201).json({ message: "Order Creation Successfull", order });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orderId = req.params.id;

    const user = await User.findById(userId);

    if (user.role !== "admin") {
      return next(createHttpError(400, "You're not allowed to do this"));
    }

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return next(createHttpError(400, "Something went wrong"));
    }
    res.status(200).json({ message: "Updated successfully", order });
  } catch (error) {
    next(error);
  }
};
const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orderId = req.params.id;

    const { status, cancelReason } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, cancelReason },
      { new: true }
    );

    if (!order) {
      return next(createHttpError(400, "Something went wrong"));
    }
    res.status(200).json({ message: "Canceled successfully", order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  updateOrder,
  cancelOrder,
};
