const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const createError = require("http-errors");

const app = express();

// Config
const config = require("./config");

// Routes
const userRouter = require("./routes/user.routes");
const errorHandler = require("./middleware/errorHandler");
const productRouter = require("./routes/product.routes");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", userRouter);
app.use("/api/product", productRouter);

// Centralized error handler
app.use(errorHandler);

// DB connection
config.db();

module.exports = app;
