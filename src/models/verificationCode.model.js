const mongoose = require("mongoose");
const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Date,
    required: true,
  },
});

const verifyCodeModel = mongoose.model("VerifyCode", verificationCodeSchema);
module.exports = verifyCodeModel;
