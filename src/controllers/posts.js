const { Post, User, Like, Comment } = require("../lib/sequelize");

const postControllers = {
  getPost: async (req, res) => {
    try {
      const { _limit = 30, _page = 1, _sortBy = "", _sortDir = "" } = req.query;

      delete req.query._limit;
      delete req.query._page;
      delete req.query._sortBy;
      delete req.query._sortDir;

      const findPosts = await Post.findAndCountAll({
        where: {
          ...req.query,
        },
        limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
        include: [
          {
            model: User,
          },
          {
            model: Like,
            include: User,
          },
          {
            model: Comment,
            include: User,
          },
        ],
        distinct: true,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
      });

      return res.status(200).json({
        message: "Find posts",
        result: findPosts,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: err.message,
      });
    }
  },
  addNewPost: async (req, res) => {
    try {
      const { caption, location, user_id } = req.body;

      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = "post_images";
      const { filename } = req.file;

      const newPost = await Post.create({
        image_url: `${uploadFileDomain}/${filePath}/${filename}`,
        caption,
        location,
        user_id,
      });
      res.status(201).json({
        message: "Post created",
        result: newPost,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: "Server Error",
      });
    }
  },
  editPost: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPost = await Post.update(
        {
          ...req.body,
        },
        {
          where: {
            id,
          },
        }
      );
      res.status(201).json({
        message: "Post edited",
        result: updatedPost,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: "Server Error",
      });
    }
  },
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedPost = await Post.destroy({
        where: {
          id,
        },
      });
      res.status(201).json({
        message: "Post deleted",
        result: deletedPost,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: "Server Error",
      });
    }
  },
  addLikePost: async (req, res) => {
    try {
      const { userId, postId } = req.params;
      const isUserAlreadyLike = await Like.findOne({
        where: {
          user_id: userId,
          post_id: postId,
        },
      });
      if (isUserAlreadyLike) {
        return res.status(400).json({
          message: "You already liked this post",
        });
      }
      await Like.create({
        user_id: userId,
        post_id: postId,
      });

      await Post.increment({ like_count: 1 }, { where: { id: postId } });
      return res.status(201).json({
        message: "Liked post success!",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
  removeLikePost: async (req, res) => {
    try {
      const { userId, postId } = req.params;
      const isUserAlreadyLike = await Like.findOne({
        where: {
          user_id: userId,
          post_id: postId,
        },
      });
      if (!isUserAlreadyLike) {
        return res.status(400).json({
          message: "You haven't liked the post yet",
        });
      }
      await Like.destroy({
        user_id: userId,
        post_id: postId,
      });

      await Post.increment({ like_count: -1 }, { where: { id: postId } });
      return res.status(201).json({
        message: "Unliked post success!",
      });
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Server Error",
      });
    }
  }
};

module.exports = postControllers;
