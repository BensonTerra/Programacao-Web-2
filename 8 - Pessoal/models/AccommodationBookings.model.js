const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('accommodationBookings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    accommodationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Accommodations',
        key: 'id',
      },
      defaultValue: null,
    },
    from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    numPeople: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendente',
      validate: {
        isIn: {
          args: [['pendente', 'aceita', 'recusada']],
          msg: 'Status must be one of: pendente, aceita, recusada',
        },
      },
    },
    commentary: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
  }, {
    timestamps: false,
  });
};
