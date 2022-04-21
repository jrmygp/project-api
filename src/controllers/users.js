const { User, Post, VerificationToken, ForgotPasswordToken } = require("../lib/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateToken } = require("../lib/jwt");
const mailer = require("../lib/mailer");
const mustache = require("mustache");
const fs = require("fs");
const { nanoid } = require("nanoid");
const moment = require("moment");

const userControllers = {
  registerUser: async (req, res) => {
    try {
      const {
        username,
        tag_name,
        email,
        password,
        full_name,
        profile_picture,
      } = req.body;

      const isUserAlreadyTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
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
        profile_picture,
      });

      // verif email
      const verificationToken = nanoid(40);

      await VerificationToken.create({
        token: verificationToken,
        user_id: createNewUser.id,
        valid_until: moment().add(1, "hour"),
      });
      const verificationLink = `http://localhost:2000/user/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username,
        verify_url: verificationLink,
      });
      await mailer({
        to: email,
        subject: "Verify your account!",
        html: renderedTemplate,
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

  verifyUser: async (req, res) => {
    try {
      const { token } = req.params;

      const findToken = await VerificationToken.findOne({
        where: {
          token,
          is_valid: true,
          valid_until: {
            [Op.gt]: moment().utc(),
          },
        },
      });

      if (!findToken) {
        return res.status(400).json({
          message: "Your token is invalid",
        });
      }

      await User.update(
        { is_verified: true },
        {
          where: {
            id: findToken.user_id,
          },
        }
      );

      findToken.is_valid = false;
      findToken.save();

      return res.redirect(
        `http://localhost:3000/verification-success?referral=${token}`
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },

  resendVerificationEmail: async (req, res) => {
    try {
      const userId = req.token.id;
      const findUser = await User.findByPk(userId);

      if (findUser.is_verified) {
        return res.status(400).json({
          message: "User is already verified",
        });
      }

      const verificationToken = nanoid(40);

      await VerificationToken.update(
        {
          is_valid: false,
        },
        {
          where: {
            is_valid: true,
            user_id: userId,
          },
        }
      );

      await VerificationToken.create({
        token: verificationToken,
        user_id: findUser.id,
        valid_until: moment().add(1, "hour"),
      });

      const verificationLink = `http://localhost:2000/user/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        verify_url: verificationLink,
      });
      await mailer({
        to: findUser.email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return res.status(201).json({
        message: "Account registered successfully!",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server Error",
      });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      // console.log(req.body);
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
        id: findUser.id,
      });
      return res.status(200).json({
        message: "Logged in user",
        result: {
          user: findUser,
          token,
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
      const { id } = req.params;

      const findUser = await User.findOne({
        where: {
          id,
        },
        include: [
          {
            model: Post,
            as: "post_user",
          },
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
  editUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = req.body;

      // Hanya ketrigger ketika user ganti username
      if (username) {
        const findUser = await User.findOne({
          where: {
            username,
          },
        });

        if (findUser) {
          return res.status(400).json({
            message: "Username already taken!",
          });
        }
      }

      if (req.file) {
        const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
        const filePath = "avatar";
        const { filename } = req.file;

        req.body.profile_picture = `${uploadFileDomain}/${filePath}/${filename}`
      }

      const updatedUser = await User.update(
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
        message: "User edited successfully",
        result: updatedUser,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
  sendForgotPasswordEmail: async (req, res) => {
    try {
      const { email } = req.body;

      const findUser = await User.findOne({
        where: {
          email,
        }
      })

      const passwordToken = nanoid(40);

      await ForgotPasswordToken.update({ is_valid: false }, {
        where: {
          user_id: findUser.id,
          is_valid: true
        }
      })

      await ForgotPasswordToken.create({
        token: passwordToken,
        valid_until: moment().add(1, "hour"),
        is_valid: true,
        user_id: findUser.id
      })

      const forgotPasswordLink =
        `http://localhost:3000/reset-password?fp_token=${passwordToken}`

      const template = fs.readFileSync(__dirname + "/../templates/forgot.html").toString()

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        forgot_password_url: forgotPasswordLink
      })

      await mailer({
        to: findUser.email,
        subject: "Reset password",
        html: renderedTemplate
      })

      return res.status(201).json({
        message: "Resent verification email"
      })

    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: "Server error"
      })
    }
  },
  changeUserForgotPassword: async (req, res) => {
    try {
      const { password, forgotPasswordToken } = req.body;

      const findToken = await ForgotPasswordToken.findOne({
        where: {
          token: forgotPasswordToken,
          is_valid: true,
          valid_until: {
            [Op.gt]: moment().utc()
          }
        }
      })

      if (!findToken) {
        return res.status(400).json({
          message: "Invalid token"
        })
      }

      const hashedPassword = bcrypt.hashSync(password, 5)

      await User.update({ password: hashedPassword }, {
        where: {
          id: findToken.user_id
        }
      })

      return res.status(200).json({
        message: "Change password success"
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: "Server error"
      })
    }
  },
};

module.exports = userControllers;
