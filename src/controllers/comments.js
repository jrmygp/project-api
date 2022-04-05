const { Comment, User } = require("../lib/sequelize");

const commentControllers = {
  getAllComment: async (req, res) => {
    try {
        const { _limit = 10, _page = 1, _sortBy = "", _sortDir = "" } = req.query;

        delete req.query._limit;
        delete req.query._page;
        delete req.query._sortBy;
        delete req.query._sortDir;
  
        const findComments = await Comment.findAndCountAll({
          where: {
            ...req.query,
          },
          limit: _limit ? parseInt(_limit) : undefined,
          offset: (_page - 1) * _limit,
          include: [
            {
              model: User
            },
          ],
          distinct: true,
          order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
        });
  
        return res.status(200).json({
          message: "Find comments",
          result: findComments,
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({
          message: "Server Error"
      })
    }
  },
  addNewComment: async (req, res) => {
    try {
        const { content, post_id, user_id } = req.body;
  
        const newComment = await Comment.create({
         content,
         post_id,
         user_id
        });
        res.status(201).json({
          message: "Comment created",
          result: newComment,
        });
      } catch (err) {
        console.log(err);
        return res.status(400).json({
          message: "Server Error",
        });
      }
  },
};

module.exports = commentControllers;
