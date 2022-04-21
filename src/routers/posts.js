const { postControllers } = require("../controllers");
const { Comment, User, Post } = require("../lib/sequelize");
const fileUploader = require("../lib/uploader");
const authorizedLoggenInUser = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.get("/", authorizedLoggenInUser,postControllers.getPost);
router.get("/get-one-post", async (req, res) => {
  try {
    const findPost = await Post.findOne({
      where: {
        ...req.query
      },
      include: [
        {
          model: User,
          attributes: {
            exclude: ["password"],
          },
          as: "post_user",
        },
        {
          model: Comment,
          include: {
            model: User,
            attributes: {
              exclude: ["password"],
            },
          },
          attributes: ["content"],
        },
      ],
    });

    return res.status(200).json({
      message: "find one post",
      result: findPost,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "server error",
    });
  }
});
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
