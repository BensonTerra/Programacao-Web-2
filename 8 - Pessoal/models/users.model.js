const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Username não pode estar vazio." },
        notEmpty: { msg: "Username não pode estar vazio." }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Email inválido." },
        notNull: { msg: "Email não pode ser nulo." },
        notEmpty: { msg: "Email não pode estar vazio." }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Password não pode ser nula." },
        notEmpty: { msg: "Password não pode estar vazia." }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'facilitador', 'estudante'),
      defaultValue: 'estudante',
      validate: {
        isIn: {
          args: [['admin', 'facilitador', 'estudante']],
          msg: "Role inválido. Use: admin, facilitador ou estudante"
        }
      }
    }
  }, {
    timestamps: false
  });
};
