const Product = require("../models/product.model");
const User = require("../models/user.model");
const createError = require("http-errors");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

const addProduct = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError(404, "User Not Found"));
    }

    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      return next(createError(401, "You're not allowed to do this"));
    }

    const {
      title,
      description,
      model,
      price,
      discountPrice,
      specs,
      brand,
      category,
    } = req.body;

    const specsObj = typeof specs === "string" ? JSON.parse(specs) : specs;

    const images = req.files;
    if (!images || images.length === 0) {
      return next(createError(404, "No Image Found. At Least One Needed."));
    }

    const uploadFromBuffer = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "laptopVision/productImages" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const uploadedImages = await Promise.all(
      images.map((image) => uploadFromBuffer(image.buffer))
    );

    const imageUrls = uploadedImages.map((r) => r.secure_url);
    const imagePublicIds = uploadedImages.map((r) => r.public_id);

    if (!title || !description || !price || !brand || !category) {
      return next(createError(404, "Something is missing"));
    }

    const product = await Product.create({
      title,
      description,
      model,
      images: {
        productImages: imageUrls,
        imagePublicIds: imagePublicIds,
      },
      price,
      brand,
      discountPrice,
      specs: {
        cpu: specsObj.cpu,
        ram: specsObj.ram,
        storage: specsObj.storage,
        gpu: specsObj.gpu,
        display: specsObj.display,
        battery: specsObj.battery,
        os: specsObj.os,
        ports: specsObj.ports,
        others: specsObj.others,
      },
      category,
    });

    if (!product) {
      return next(createError(400, "Product Creation Failed"));
    }

    res.status(200).json({ message: "Product Creation Successful", product });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
      return next(createError(404, "Product Not Found"));
    }

    res.status(201).json({ message: "Product fethed Successfully", product });
  } catch (error) {
    next(error);
  }
};
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const category = req.query.category ? req.query.category.split(",") : [];

    const sortField = req.query.sortField === "name" ? "title" : "createdAt"; // default to date
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // asc by default

    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category.length > 0) {
      query.category = { $in: category };
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: sortOrder });

    if (!products || products.length === 0) {
      return next(createError(404, "No Products Available Here"));
    }

    const total = await Product.countDocuments(query);

    res.status(200).json({
      message: "All products fetched successfully",
      products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError(404, "User Not Found"));
    }

    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      return next(createError(401, "You're not allowed to do this"));
    }

    const { productId } = req.params;
    let {
      title,
      description,
      model,
      price,
      discountPrice,
      specs,
      removeImages,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return next(createError(404, "Product Not Found"));
    }

    const specsObj = typeof specs === "string" ? JSON.parse(specs) : specs;
    const removeList =
      typeof removeImages === "string"
        ? JSON.parse(removeImages)
        : removeImages || [];

    if (removeList.length > 0) {
      for (let imgUrl of removeList) {
        const index = product.images.productImages.indexOf(imgUrl);
        if (index > -1) {
          const publicId = product.images.imagePublicIds[index];
          await cloudinary.uploader.destroy(publicId);
          product.images.productImages.splice(index, 1);
          product.images.imagePublicIds.splice(index, 1);
        }
      }
    }

    const newImages = req.files;
    if (newImages && newImages.length > 0) {
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "laptopVision/productImages" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const uploadedResults = await Promise.all(
        newImages.map((img) => uploadFromBuffer(img.buffer))
      );

      const newUrls = uploadedResults.map((r) => r.secure_url);
      const newPublicIds = uploadedResults.map((r) => r.public_id);

      product.images.productImages.push(...newUrls);
      product.images.imagePublicIds.push(...newPublicIds);
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (model) product.model = model;
    if (price) product.price = price;
    if (discountPrice) product.discountPrice = discountPrice;
    if (specsObj) {
      product.specs = {
        ...product.specs,
        ...specsObj,
      };
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return next(createError(404, "User Not Found"));
    }

    const user = await User.findById(userId);
    if (user?.role !== "admin") {
      return next(createError(401, "You're not allowed to do this"));
    }

    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(createError(404, "Product Not Found"));
    }

    if (product.images && product.images.length > 0) {
      for (let imgUrl of product.images) {
        const publicId = imgUrl.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(
          `laptopVision/productImages/${publicId}`
        );
      }
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
