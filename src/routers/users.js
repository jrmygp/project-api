const { userControllers } = require("../controllers");
const authorizedLoggenInUser = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/register", userControllers.registerUser);
router.post("/login", userControllers.loginUser);
router.get("/refresh-token", authorizedLoggenInUser, userControllers.keepLogin);
router.get("/:id", userControllers.getUser);

module.exports = router;
