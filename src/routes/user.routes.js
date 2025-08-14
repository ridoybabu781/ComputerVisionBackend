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
const validate = require("../middlewares/validate");
const upload = require("../utils/multer");
const {
  registerValidation,
  updateProfileValidation,
  updateProfilePicValidation,
} = require("../valitations/user.validate");
const verificationCodeValidation = require("../valitations/verificationCode.validate");
const router = require("express").Router();

router.post("/sendCode", validate(verificationCodeValidation), sendCode);
router.post("/register", validate(registerValidation), createUser);
router.post("/login", login);
router.get("/profile", userCheck, profile);
router.put(
  "/updateProfile",
  userCheck,
  validate(updateProfileValidation),
  updateProfile
);
router.put("/updatePassword", userCheck, updatePassword);
router.put(
  "/updateProfilePicture",
  userCheck,
  upload.single("profilePic"),
  validate(updateProfilePicValidation),
  updateProfilePicture
);

router.post(
  "/sendForgetPassCode",
  validate(verificationCodeValidation),
  forgetPasswordCode
);
router.post("/forgetPassword", forgetPassword);
router.post("/logout", userCheck, logout);

// Admin Area

router.post(
  "/admin/rr/rsc-create-bro-admin",
  validate(registerValidation),
  createAdmin
);
router.post("/deleteProfile", userCheck, deleteProfile);
router.post("/blockProfile/:id", userCheck, blockProfile);
router.post("/unblockProfile/:id", userCheck, unBlockProfile);
router.get("/getBlockedUser", userCheck, getBlockedProfile);

module.exports = router;
