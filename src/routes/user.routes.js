const { createAdmin } = require("../controllers/admin.controller");
const {
  sendCode,
  createUser,
  login,
  profile,
  updateProfile,
  updateProfilePicture,
  forgetPasswordCode,
  forgetPassword,
  updatePassword,
  logout,
  updateCoverPicture,
  deleteProfile,
  blockProfile,
  unBlockProfile,
  getBlockedProfile,
} = require("../controllers/user.controller");

const userCheck = require("../middlewares/User");
const upload = require("../utils/multer");
const router = require("express").Router();

router.post("/sendCode", sendCode);
router.post("/register", createUser);
router.post("/login", login);
router.get("/profile", userCheck, profile);
router.put("/updateProfile", userCheck, updateProfile);
router.put("/updatePassword", userCheck, updatePassword);
router.put(
  "/updateProfilePicture",
  userCheck,
  upload.single("profilePic"),
  updateProfilePicture
);

router.post("/sendForgetPassCode", forgetPasswordCode);
router.post("/forgetPassword", forgetPassword);
router.post("/logout", userCheck, logout);

// Admin Area

router.post("/admin/rr/rsc-create-bro-admin", createAdmin);
router.post("/deleteProfile", userCheck, deleteProfile);
router.post("/blockProfile/:id", userCheck, blockProfile);
router.post("/unblockProfile/:id", userCheck, unBlockProfile);
router.get("/getBlockedUser", userCheck, getBlockedProfile);

module.exports = router;
