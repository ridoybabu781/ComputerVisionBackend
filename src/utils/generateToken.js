const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (info, expiresIn = "1d") => {
  return jwt.sign(info, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;
