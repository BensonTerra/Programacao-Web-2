const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Accommodations', {
    // Title and description
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notNull: { msg: "Accommodation title cannot be null." },
        notEmpty: { msg: "Accommodation title cannot be empty." }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // Location and room type
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    room_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    // Capacity
    bed_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "Bed count must be an integer." },
        min: {
          args: [1],
          msg: "Minimum bed count is 1."
        }
      }
    },

    // Price and rating
    price_per_night: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isDecimal: { msg: "Price per night must be a decimal number." },
        min: {
          args: [0],
          msg: "Price per night cannot be negative."
        }
      }
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [0], msg: "Rating cannot be less than 0." },
        max: { args: [5], msg: "Rating cannot be more than 5." }
      }
    },

    // Availability
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    timestamps: false,
  });
};
