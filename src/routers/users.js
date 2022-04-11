const { userControllers } = require("../controllers");
const authorizedLoggenInUser = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/register", userControllers.registerUser);
router.get("/verify:token", userControllers.verifyUser)
router.post("/resend-verification", userControllers.resendVerificationEmail)
router.post("/login", userControllers.loginUser);
router.get("/refresh-token", authorizedLoggenInUser, userControllers.keepLogin);
router.get("/:id", userControllers.getUser);
router.patch("/:id", userControllers.editUser)

module.exports = router;
