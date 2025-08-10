const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendEmail = (email, subject, html) => {
  const mailerOption = {
    from: "Ridoy",
    to: email,
    subject,
    html,
  };

  return transporter.sendMail(mailerOption);
};

module.exports = sendEmail;
