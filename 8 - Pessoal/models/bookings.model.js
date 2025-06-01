const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Bookings', {
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
      allowNull: true,  // pode ser null se for inscrição em evento
      references: {
        model: 'Accommodations',
        key: 'id',
      },
      defaultValue: null,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,  // pode ser null se for reserva de alojamento
      references: {
        model: 'Events',
        key: 'id',
      },
      defaultValue: null,
    },

    // --- Campos relacionados a reservas de alojamento ---
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

    // --- Campos comuns ---
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
    data_validacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    timestamps: false,
  });
};

