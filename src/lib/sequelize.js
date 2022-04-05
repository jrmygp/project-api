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

// HUBUNGAN POST KE USER (1 : M)
Post.belongsTo(User, { foreignKey: "user_id"})
User.hasMany(Post, { foreignKey: "user_id"})

// HUBUNGAN POST KE USER MELALUI TABLE LIKE (M : M)
User.hasMany(Like, { foreignKey: "user_id"})
Like.belongsTo(User, { foreignKey: "user_id"})
Post.hasMany(Like, { foreignKey: "post_id"})
Like.belongsTo(Post, { foreignKey: "post_id"})

// HUBUNGAN POST KE COMMENT (1 : M)
Comment.belongsTo(Post, { foreignKey: "post_id"})
Post.hasMany(Comment, { foreignKey: "post_id"})

Comment.belongsTo(User, {foreignKey: "user_id"})
User.hasMany(Comment, {foreignKey: "user_id"})


module.exports = { sequelize, User, Post, Like, Comment };
