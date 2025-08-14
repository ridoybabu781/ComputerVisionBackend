const Order = require("../models/order.model");
const User = require("../models/user.model");
const createHttpError = require("http-errors");
const config = require("../config");
const sendEmail = require("../utils/sendEmail");

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
        product: item.product,
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
      userId,
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

    const htmlContent = `
      <h2>Order Placed Successfully!</h2>
      <p>Hi ${user.name},</p>
      <p>Your order with ID <b>${order._id}</b> has been submitted successfully.</p>
      <p>Payment Method: <b>${paymentMethod}</b></p>
      <p>Please confirm your payment to complete the order.</p>
      <p>Thank you for shopping with us!</p>
    `;
    await sendEmail(user.email, "Your Order has been placed!", htmlContent);

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

    if (!userId) return next(createHttpError(401, "Unauthorized"));

    const { cancelReason } = req.body;
    if (!cancelReason)
      return next(createHttpError(400, "Cancel reason is required"));

    const order = await Order.findById(orderId);

    if (!order) return next(createHttpError(404, "Order not found"));

    if (order.user.toString() !== userId.toString()) {
      return next(
        createHttpError(403, "You're not allowed to cancel this order")
      );
    }

    if (["Shipped", "Delivered"].includes(order.status)) {
      return next(
        createHttpError(
          400,
          "Cannot cancel order after it has been shipped or delivered"
        )
      );
    }

    order.status = "Cancelled";
    order.cancelReason = cancelReason;
    await order.save();

    const user = await User.findById(userId);
    const htmlContent = `
      <h2>Order Cancellation</h2>
      <p>Hi ${user.name},</p>
      <p>Your order with ID <b>${order._id}</b> has been canceled successfully.</p>
      <p>Reason: ${cancelReason}</p>
      <p>If this is a mistake, please contact support immediately.</p>
    `;
    await sendEmail(user.email, "Your Order has been canceled", htmlContent);

    res.status(200).json({ message: "Order canceled successfully", order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  updateOrder,
  cancelOrder,
};
