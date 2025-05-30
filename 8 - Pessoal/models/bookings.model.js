const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Bookings', {
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
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Events',
        key: 'id',
      },
    },

    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendente',
    },
    comentario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data_validacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }

  }, {
    timestamps: false
  });
};

