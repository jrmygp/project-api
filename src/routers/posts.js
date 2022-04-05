const {postControllers} = require("../controllers")
const fileUploader = require("../lib/uploader")

const router = require("express").Router()

router.get("/", postControllers.getPost)
router.post("/", fileUploader({
    destinationFolder: "posts",
    fileType: "image",
    prefix: "POST"
}).single("post_image_file") ,postControllers.addNewPost)
router.patch("/:id", postControllers.editPost)
router.delete("/:id", postControllers.deletePost)

module.exports = router