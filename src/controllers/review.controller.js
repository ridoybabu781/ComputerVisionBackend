const Review = require("../models/review.model");
const User = require("../models/user.model");
const createError = require("http-errors");
const Order = require("../models/order.model");
const cloudinary = require("../utils/cloudinary");

const addReview = async (req, res, next) => {
  try {
    const userId = req.userId;
    const productId = req.params.id;

    const user = await User.findById(userId);

    if (user.role !== "user") {
      return next(createError(401, "You're not allowed to do this "));
    }

    if (!productId) {
      return next(createError(404, "Product Not Found"));
    }

    const order = await Order.findOne({ userId, productId });

    if (!order) {
      return next(createError(401, "Order first to submit review"));
    }

    const { rating, review } = req.body;

    const files = req.files;

    let uploadedImages = [];

    if (Array.isArray(files) && files.length > 0) {
      const uploadImageStream = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "LaptopVision/Review",
            },
            (err, data) => {
              if (err) reject(err);
              resolve(data);
            }
          );
          stream.end(fileBuffer);
        });
      };

      uploadedImages = await Promise.all(
        files.map((image) => uploadImageStream(image.buffer))
      );
    }

    const imageUrls = uploadedImages.map((img) => img.secure_url);

    const publicIds = uploadedImages.map((r) => r.public_id);

    const newReview = await Review.create({
      userId,
      productId,
      rating,
      review,
      images: { imageLinks: imageUrls, publicIds },
    });

    if (!newReview) {
      return next(createError(400, "Review Creation Failed"));
    }

    res
      .status(201)
      .json({ message: "Review Created Successfull", review: newReview });
  } catch (error) {
    next(error);
  }
};
const removeReview = async (req, res, next) => {
  try {
    const userId = req.userId;
    const reviewId = req.params.id;

    const review = await Review.findOne({ _id: reviewId, userId });

    if (!review) {
      return next(createError(404, "Review Not Found"));
    }

    await Review.findByIdAndDelete(reviewId);

    const { images } = req.body;

    if (Array.isArray(images.publicIds) && images.publicIds.length > 0) {
      for (publicId of images.publicIds || []) {
        await cloudinary.uploader.destroy(`laptopVision/Review/${publicId}`);
      }
    }
  } catch (error) {
    next(error);
  }
};
const editReview = async (req, res, next) => {
  try {
    const userId = req.userId;
    const reviewId = req.params.id;

    const review = await Review.findOne({ userId, _id: reviewId });

    if (!review) {
      return next(createError(404, "Review Not Found"));
    }

    const { rating, reviewText, removeImages } = req.body;

    if (Array.isArray(removeImages.publicIds) && images.publicIds.length > 0) {
      for (const publicId of removeImages.publicIds || []) {
        await cloudinary.uploader.destroy(`laptopVision/Review/${publicId}`);
      }

      review.images.imageLinks = review.images.imageLinks.filter(
        (_, index) =>
          !removeImages.publicIds.includes(review.images.publicIds[index])
      );
      review.images.publicIds = review.images.publicIds.filter(
        (id) => !removeImages.publicIds.includes(id)
      );
    }

    const files = req.files;

    let updateImages;

    if (Array.isArray(files) && files.length > 0) {
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload(
            {
              folder: "laptopVision/Review",
            },
            (err, data) => {
              if (err) reject(err);
              resolve(data);
            }
          );
          stream.end(fileBuffer);
        });
      };

      updateImages = await Promise.all(
        files.map((image) => uploadFromBuffer(image.buffer))
      );
    }

    const imageUrls = updateImages.map((img) => img.secure_url);

    const publicIds = updateImages.map((r) => r.public_id);

    review.images.imageLinks.push(...imageUrls);
    review.images.publicIds.push(...publicIds);

    if (rating) review.rating = rating;
    if (reviewText) review.reviewText = reviewText;

    await review.save();
  } catch (error) {
    next(error);
  }
};
const myReviews = async (req, res, next) => {
  try {
    const userId = req.userId;

    const reviews = await Review.find({ userId });

    if (!reviews) {
      return next(createError(404, "No review yet"));
    }

    res.status(200).json({ message: "Reviews Fetched Successfully", reviews });
  } catch (error) {
    next(error);
  }
};
const productReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const reviews = await Review.find({ productId });

    if (!reviews) {
      return next(createError(404, "No review yet"));
    }

    res.status(200).json({ message: "Reviews Fetched Successfully", reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  removeReview,
  editReview,
  myReviews,
  productReviews,
};
