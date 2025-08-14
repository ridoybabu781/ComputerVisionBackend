const axios = require("axios");
const qs = require("qs");
const config = require("../config");
const User = require("../models/user.model");
const createHttpError = require("http-errors");
const Order = require("../models/order.model");
const sendEmail = require("../utils/sendEmail");

const handleCODPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = false;
    order.paymentMethod = "COD";
    order.status = "Pending";
    await order.save();

    return res.status(200).json({
      message: "Order placed successfully with Cash on Delivery",
      order,
    });
  } catch (error) {
    next(error);
  }
};

const handleSSLCommerzPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    const userId = req.userId;

    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createHttpError(404, "User Not Found"));
    }

    const transactionId = "txn_" + Date.now();
    const data = {
      store_id: config.store_id,
      store_passwd: config.store_passwd,
      total_amount: order.totalPrice,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${config.backendUrl}/api/payment/success/${order._id}`,
      fail_url: `${config.backendUrl}/api/payment/fail/${order._id}`,
      cancel_url: `${config.backendUrl}/api/payment/cancel/${order._id}`,
      cus_name: user?.name || "Guest",
      cus_email: user?.email || "guest@example.com",
      product_name: `Order #${order._id}`,
      product_category: "General",
      product_profile: "general",
    };

    const SSLCommerz_API =
      "https://sandbox.sslcommerz.com/gwprocess/v3/api.php";

    const response = await axios.post(SSLCommerz_API, qs.stringify(data), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return res.status(200).json({ url: response.data.GatewayPageURL });
  } catch (error) {
    next(error);
  }
};

const paymentSuccess = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        isPaid: true,
        paidAt: new Date(),
        status: "Paid",
      },
      { new: true }
    );

    const user = await User.findById(order.userId);

    const htmlContent = `
      <h2>Payment Successful!</h2>
      <p>Hi ${user.name},</p>
      <p>Your payment for order ID <b>${order._id}</b> was successful.</p>
      <p>Thank you for shopping with us!</p>
    `;

    await sendEmail(user.email, "Payment Successful", htmlContent);

    return res.redirect("/payment/success");
  } catch (error) {
    next(error);
  }
};

const paymentFail = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { isPaid: false, status: "Payment Failed" },
      { new: true }
    );

    if (!order) return next(createHttpError(404, "Order not found"));

    const user = await User.findById(order.userId);

    const htmlContent = `
      <h2>Payment Failed</h2>
      <p>Hi ${user.name},</p>
      <p>Your payment for order ID <b>${order._id}</b> could not be processed.</p>
      <p>Please try again or contact support if the problem persists.</p>
    `;

    await sendEmail(user.email, "Payment Failed", htmlContent);

    return res.redirect("/payment/fail");
  } catch (error) {
    next(error);
  }
};

const paymentCancel = async (req, res) => {
  try {
    const { orderId } = req.params;
    await Order.findByIdAndUpdate(orderId, {
      isPaid: false,
    });
    return res.redirect("/payment/cancel");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCODPayment,
  handleSSLCommerzPayment,
  paymentSuccess,
  paymentCancel,
  paymentFail,
};
