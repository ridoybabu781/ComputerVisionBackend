const express = require("express");
const productRouter = express.Router();
const User = require("../middlewares/User");
const {
  addProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const upload = require("../utils/multer");
const validate = require("../middlewares/validate");
const productValidation = require("../valitations/product.validate");

productRouter.post(
  "/addProduct",
  upload.array("images", 5),
  User,
  validate(productValidation),
  addProduct
);
productRouter.get("/getProduct/:id", getProduct);
productRouter.get("/getProducts", getProducts);
productRouter.put(
  "/updateProduct/:id",
  User,
  validate(productValidation),
  updateProduct
);
productRouter.delete("/deleteProduct/:id", User, deleteProduct);

module.exports = productRouter;
