const { userControllers } = require("../controllers");
const authorizedLoggenInUser = require("../middlewares/authMiddleware");
const fileUploader = require("../lib/uploader");

const router = require("express").Router();

router.post("/register", userControllers.registerUser);
router.get("/verify/:token", userControllers.verifyUser);
router.post("/resend-verification", authorizedLoggenInUser,userControllers.resendVerificationEmail);
router.post("/login", userControllers.loginUser);
router.get("/refresh-token", authorizedLoggenInUser, userControllers.keepLogin);
router.get("/:id", userControllers.getUser);
router.post("/forgot-password-email", userControllers.sendForgotPasswordEmail)
router.patch("/change-password-forgot", userControllers.changeUserForgotPassword)
router.patch(
  "/:id",
  fileUploader({
    destinationFolder: "avatar",
    fileType: "image",
    prefix: "AVATAR",
  }).single("avatar_image_file"),
  userControllers.editUser
);


module.exports = router;
