const Order = require("../models/order.model");
const User = require("../models.user.model");
const createHttpError = require("http-errors");

const addOrder = async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById({ userId });

  if (user?.role === "user") {
    return next(createHttpError(404, "User Not Find"));
  }

  const productId = req.params.id;
  if (!productId) {
    return next(createHttpError(404, "Product Not Found"));
  }

  const {
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    userId,
    productId,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    },
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  });

  if (!order) {
    return next(createHttpError(400, "Order Creation Failed"));
  }

  res.status(200).json({ message: "Order Completed Successfully", order });
};
const updateOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orderId = req.params.id;

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
const cancelOrder = async (req, res, next) => {};

module.exports = {
  addOrder,
  updateOrder,
  cancelOrder,
};
