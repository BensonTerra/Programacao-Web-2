const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define("AccommodationRatings", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      accommodationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Accommodations",
          key: "id",
        },
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Rating cannot be less than 0.",
          },
          max: {
            args: [5],
            msg: "Rating cannot be more than 5.",
          },
        },
      },
      commentary: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["userId", "accommodationId"], // Um usuário só pode avaliar uma vez o mesmo alojamento
        },
      ],
    }
  );
};
