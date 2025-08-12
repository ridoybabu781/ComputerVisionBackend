const express = require("express");
const { addReview, removeReview } = require("../controllers/review.controller");
const User = require("../middlewares/User");
const upload = require("../utils/multer");

const reviewRouter = express.Router();

reviewRouter.post("/addReview/:id", User, upload.array("images", 5), addReview);
reviewRouter.post("/removeReview", User, removeReview);

module.exports = reviewRouter;
