const { User, Post } = require("../lib/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateToken } = require("../lib/jwt");

const userControllers = {
  registerUser: async (req, res) => {
    try {
      const { username, tag_name, email, password, full_name, profile_picture } = req.body;

      const isUserAlreadyTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }, { tag_name }],
        },
      });
      if (isUserAlreadyTaken) {
        return res.status(400).json({
          message: "User already taken",
        });
      }
      const hashedPassword = bcrypt.hashSync(password, 5);
      const createNewUser = await User.create({
        username,
        tag_name,
        email,
        password: hashedPassword,
        full_name,
        profile_picture
      });
      return res.status(201).json({
        message: "New user created",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(req.body)
      const findUser = await User.findOne({
        where: {
          username,
        },
      });
      if (!findUser) {
        return res.status(400).json({
          message: "Wrong username or password!",
        });
      }
      const isPasswordCorrect = bcrypt.compareSync(password, findUser.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Wrong username or password!",
        });
      }
      delete findUser.dataValues.password;
      const token = generateToken({
        id: findUser.id
      })
      return res.status(200).json({
        message: "Logged in user",
        result: {
          user: findUser,
          token
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
  keepLogin: async (req, res) => {
    console.log("KONTTOOOLLLL")
    try {
      const { token } = req;
      const renewedToken = generateToken({ id: token.id });
      const findUser = await User.findByPk(token.id);

      delete findUser.dataValues.password;
      return res.status(200).json({
        message: "Renewed user token",
        result: findUser,
        token: renewedToken,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },
  getUser: async (req, res) => {
    try {
      const {id} = req.params;
      console.log(id)

      const findUser = await User.findOne({
        where: {
          id
        },
        include: [
          {
            model: Post,
          }
        ],
      });

      return res.status(200).json({
        message: "User found",
        result: findUser,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: err.message,
      });
    }
  },
};

module.exports = userControllers;
