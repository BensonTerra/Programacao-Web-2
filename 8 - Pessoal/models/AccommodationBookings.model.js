const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('accommodationBookings', {
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
    accommodationId: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: 'Accommodations',
        key: 'id',
      },
      defaultValue: null,
    },

    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    num_pessoas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },

    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendente',
    },
    comentario: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
  }, {
    timestamps: false,
  });
};

