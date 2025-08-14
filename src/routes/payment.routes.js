import express from "express";
import {
  paymentSuccess,
  paymentFail,
  paymentCancel,
  handleCODPayment,
  handleSSLCommerzPayment,
} from "../controllers/payment.controller";
import userCheck from "../middlewares/User";

const router = express.Router();

router.post("/cod/:orderId", userCheck, handleCODPayment);
router.post("/sslcommerz/:orderId", userCheck, handleSSLCommerzPayment);

router.get("/success/:orderId", paymentSuccess);
router.get("/fail/:orderId", paymentFail);
router.get("/cancel/:orderId", paymentCancel);

export default router;
