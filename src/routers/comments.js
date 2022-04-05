const { commentControllers } = require("../controllers")

const router = require("express").Router()

router.get("/", commentControllers.getAllComment)
router.post("/", commentControllers.addNewComment)

module.exports = router