const { Sequelize } = require("sequelize");
const mysqlConfig = require("../configs/database");

const sequelize = new Sequelize({
  username: mysqlConfig.MYSQL_USERNAME,
  password: mysqlConfig.MYSQL_PASSWORD,
  database: mysqlConfig.MYSQL_DB_NAME,
  port: 3306,
  dialect: "mysql",
  logging: false,
});

const User = require("../models/user")(sequelize);
const Post = require("../models/post")(sequelize);
const Like = require("../models/like")(sequelize);
const Comment = require("../models/comment")(sequelize);
const VerificationToken = require("../models/verification_tokens")(sequelize);
const ForgotPasswordToken = require("../models/forgot_password_token")(
  sequelize
);

// HUBUNGAN POST KE USER (1 : M)
Post.belongsTo(User, { foreignKey: "user_id", as: "post_user" });
User.hasMany(Post, { foreignKey: "user_id", as: "post_user" });

// HUBUNGAN POST KE USER MELALUI TABLE LIKE (M : M)
User.belongsToMany(Post, {
  through: Like,
  foreignKey: "user_id",
  as: "user_like",
});
Post.belongsToMany(User, {
  through: Like,
  foreignKey: "post_id",
  as: "user_like",
});

// HUBUNGAN USER-LIKE-POST (1 : M)
User.hasMany(Like, { foreignKey: "user_id", as: "like_user" });
Like.belongsTo(User, { foreignKey: "user_id", as: "like_user" });
Post.hasMany(Like, { foreignKey: "post_id", as: "post_like" });
Like.belongsTo(Post, { foreignKey: "post_id", as: "post_like" });

// HUBUNGAN POST KE COMMENT (1 : M)
Comment.belongsTo(Post, { foreignKey: "post_id" });
Post.hasMany(Comment, { foreignKey: "post_id" });

Comment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });

// HUBUNGAN VERIF TOKEN KE USER (1 : M)
VerificationToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(VerificationToken, { foreignKey: "user_id" });

// HUBUNGAN FORGET PASSWORD TOKEN KE USER (1 : M)
ForgotPasswordToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ForgotPasswordToken, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  User,
  Post,
  Like,
  Comment,
  VerificationToken,
  ForgotPasswordToken,
};
