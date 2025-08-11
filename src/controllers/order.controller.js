const Order = require("../models/order.model");
const User = require("../models.user.model");
const createHttpError = require("http-errors");
const config = require("../config");
const qs = require("qs");

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

    // Create order first with isPaid false, status Pending
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
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

    if (paymentMethod === "COD") {
      return res.status(200).json({
        message: "Order Completed Successfully. Used Cash on Delivery",
        order,
      });
    }

    if (paymentMethod === "SSLCommerz") {
      const transactionId = "txn_" + Date.now();

      const data = {
        store_id: config.store_id,
        store_passwd: config.store_passwd,
        total_amount: totalPrice,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `https://laptopvisionbackend.onrender.com/api/payment/success?orderId=${order._id}`,
        fail_url: `https://laptopvisionbackend.onrender.com/api/payment/fail?orderId=${order._id}`,
        cancel_url: `https://laptopvisionbackend.onrender.com/api/payment/cancel?orderId=${order._id}`,
        cus_name: user.name,
        cus_email: user.email,
        product_name: orderItems.map((item) => item.product.name).join(", "),
        product_category: "General",
        product_profile: "general",
        value_a: order._id.toString(),
      };

      const SSLCommerz_API =
        "https://sandbox.sslcommerz.com/gwprocess/v3/api.php";

      const response = await axios.post(SSLCommerz_API, qs.stringify(data), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      return res.status(200).json({ url: response.data.GatewayPageURL });
    }

    return res.status(400).json({ message: "Unsupported payment method" });
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
