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

router.get("/success/:orderId", paymentSuccess);
router.get("/fail/:orderId", paymentFail);
router.get("/cancel/:orderId", paymentCancel);

module.exports = router;
