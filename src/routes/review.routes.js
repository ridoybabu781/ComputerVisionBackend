const express = require("express");
const {
  addReview,
  removeReview,
  editReview,
  myReviews,
  productReviews,
} = require("../controllers/review.controller");
const User = require("../middlewares/User");
const upload = require("../utils/multer");

const reviewRouter = express.Router();

reviewRouter.post("/addReview/:id", User, upload.array("images", 5), addReview);
reviewRouter.post("/removeReview", User, removeReview);
reviewRouter.post("/editReview", User, upload.array("images", 5), editReview);
reviewRouter.post("/myReviews", User, myReviews);
reviewRouter.post("/productReviews", productReviews);

module.exports = reviewRouter;
