const jwt = require("jsonwebtoken");
require("dotenv").config();

const userCheck = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.token.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = userCheck;
