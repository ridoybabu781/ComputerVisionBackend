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

    const { title, description, model, price, discountPrice, specs } = req.body;

    const specsObj = typeof specs === "string" ? JSON.parse(specs) : specs;

    const images = req.files;
    if (!images || images.length === 0) {
      return next(createError(404, "No Image Found. At Least One Needed."));
    }

    const uploadFromBuffer = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "computerVision/productImages" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const uploadedImages = await Promise.all(
      images.map((image) => {
        const fileBuffer = fs.readFileSync(image.path);
        return uploadFromBuffer(fileBuffer);
      })
    );
    const imageUrls = uploadedImages.map((r) => r.secure_url);

    if (!title || !description || !model || !price) {
      return next(createError(404, "Something is missing"));
    }

    const product = await Product.create({
      title,
      description,
      model,
      images: imageUrls,
      price,
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
    const product = await Product.find();

    if (!product) {
      return next(createError(404, "No Products Available Here"));
    }

    res
      .status(201)
      .json({ message: "All products fethed Successfully", product });
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
        const publicId = imgUrl.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(
          `computerVision/productImages/${publicId}`
        );
      }
      product.images = product.images.filter(
        (img) => !removeList.includes(img)
      );
    }

    const newImages = req.files;
    if (newImages && newImages.length > 0) {
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "computerVision/productImages" },
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
      product.images.push(...newUrls);
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
          `computerVision/productImages/${publicId}`
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
