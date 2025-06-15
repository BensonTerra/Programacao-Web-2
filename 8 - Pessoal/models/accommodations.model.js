const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("Accommodations",
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
        references: {
          model: "Users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notNull: { msg: "Accommodation title cannot be null." },
          notEmpty: { msg: "Accommodation title cannot be empty." },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      room_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      bed_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Bed count must be an integer." },
          min: {
            args: [1],
            msg: "Minimum bed count is 1.",
          },
        },
      },
      price_per_night: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          isDecimal: { msg: "Price per night must be a decimal number." },
          min: {
            args: [0],
            msg: "Price per night cannot be negative.",
          },
        },
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null,
        validate: {
          min: { args: [0], msg: "Rating cannot be less than 0." },
          max: { args: [5], msg: "Rating cannot be more than 5." },
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
