const express = require("express");
const userCheck = require("../middlewares/User");
const router = express.Router();
const {
  handleCODPayment,
  handleSSLCommerzPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} = require("../controllers/payment.controller");

router.post("/cod/:orderId", userCheck, handleCODPayment);
router.post("/sslcommerz/:orderId", userCheck, handleSSLCommerzPayment);

router.route("/success/:orderId").get(paymentSuccess).post(paymentSuccess);
router.route("/fail/:orderId").get(paymentFail).post(paymentFail);
router.route("/cancel/:orderId").get(paymentCancel).post(paymentCancel);

module.exports = router;
