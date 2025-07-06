const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("Events",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        references: { //relation
          model: "Users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notNull: { msg: "Event title cannot be null." },
          notEmpty: { msg: "Event title cannot be empty." },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          isDecimal: { msg: "Price must be a decimal number." },
          min: { args: [0], msg: "Price cannot be negative." },
        },
      },
      available_from: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      available_to: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
};
