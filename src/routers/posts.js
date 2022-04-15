const { postControllers } = require("../controllers");
const fileUploader = require("../lib/uploader");
const authorizedLoggenInUser = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.get("/", authorizedLoggenInUser,postControllers.getPost);
router.post(
  "/",
  fileUploader({
    destinationFolder: "posts",
    fileType: "image",
    prefix: "POST",
  }).single("post_image_file"),
  postControllers.addNewPost
);
router.patch("/:id", authorizedLoggenInUser, postControllers.editPost);
router.delete("/:id", authorizedLoggenInUser, postControllers.deletePost);
router.post("/:postId/likes/:userId", authorizedLoggenInUser, postControllers.addLikePost);
router.delete("/:postId/likes/:userId", authorizedLoggenInUser, postControllers.removeLikePost);

module.exports = router;
