const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('EventBookings', {
    // Chaves primárias e estrangeiras
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
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,  
      references: {
        model: 'Events',
        key: 'id',
      },
      defaultValue: null,
    },

    // --- Campos comuns ---
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'inscrito',
    },
  }, {
    timestamps: false,
  });
};

