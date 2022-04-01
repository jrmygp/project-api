const userControllers = require("../controllers")

const router = require("express").Router()

router.post("/register", userControllers.registerUser)
router.post("/login", userControllers.loginUser)

module.exports = router