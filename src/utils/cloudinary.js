const cloudinary = require("cloudinary").v2;
const config = require("../config");

cloudinary.config({
  cloud_name: config.cName,
  api_key: config.cApi,
  api_secret: config.cApi_Secret,
});

module.exports = cloudinary;
