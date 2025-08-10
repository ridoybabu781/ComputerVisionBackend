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

productRouter.post("/addProduct", upload.array("images", 5), User, addProduct);
productRouter.get("/getProduct", getProduct);
productRouter.get("/getProducts", getProducts);
productRouter.put("/updateProduct/:id", User, updateProduct);
productRouter.delete("/deleteProduct/:id", User, deleteProduct);

module.exports = productRouter;
