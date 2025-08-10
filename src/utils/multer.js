const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  filename: function (res, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
module.exports = upload;
