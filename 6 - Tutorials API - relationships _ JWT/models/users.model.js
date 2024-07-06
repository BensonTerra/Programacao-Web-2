const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notNull: { msg: "Username cannot be empty or null!" }
      }
    },
    email: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      trim: true, // remove spaces on both ends             
      allowNull: false,
      validate: {
        notNull: { msg: "Password cannot be empty or null!" }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'regular'),
      defaultValue: 'regular',
      validate: {
        isIn: {
          args: [['admin', 'regular']],
          msg: "Allowed roles: admin or regular"
        }
      }
    }
  }, {
    timestamps: false
  });
};
