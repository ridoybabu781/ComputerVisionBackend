require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const config = {
  port: process.env.PORT,
  db_url: process.env.DB_URL,
  jwt_secret: process.env.JWT_SECRET,
  cName: process.env.CNAME,
  cApi: process.env.CAPI_KEY,
  cApi_Secret: process.env.CAPI_SECRET,

  store_id: process.env.SSLC_STORE_ID,
  store_passwd: process.env.SSLC_STORE_PASS,

  db: () => {
    const database = async () => {
      await mongoose.connect(config.db_url);
      console.log("DB Connected");
    };
    return database();
  },
  transporter: nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  }),
};

module.exports = config;
