const { User } = require("../lib/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

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
      return res.status(200).json({
        message: "Logged in user",
        result: {
          user: findUser,
          token: "12345",
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
};

module.exports = userControllers;
