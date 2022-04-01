const { DataTypes } = require("sequelize");

const Post = (sequelize) => {
  return sequelize.define("Post", {
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};

module.exports = Post;
