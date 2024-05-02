module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Text can not be empety or null" }
      }
    }
  },
    {
      timestamp: false
    })
  return Comment
}