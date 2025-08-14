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
const validate = require("../middlewares/validate");
const reviewValidation = require("../valitations/review.validate");

const reviewRouter = express.Router();

reviewRouter.post(
  "/addReview/:id",
  User,
  upload.array("images", 5),
  validate(reviewValidation),
  addReview
);
reviewRouter.post("/removeReview", User, removeReview);
reviewRouter.put(
  "/editReview",
  User,
  upload.array("images", 5),
  validate(reviewValidation),
  editReview
);
reviewRouter.get("/myReviews", User, myReviews);
reviewRouter.get("/productReviews", productReviews);

module.exports = reviewRouter;
