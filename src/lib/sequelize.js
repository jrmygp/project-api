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

module.exports = { sequelize, User, Post, Like, Comment };
