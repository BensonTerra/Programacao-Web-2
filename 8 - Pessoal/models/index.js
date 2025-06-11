const { dbConfig } = require('../utils/config.js');
const { Sequelize, DataTypes } = require('sequelize');
const clear = require('clear');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to DB has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
})();

const db = {};
db.sequelize = sequelize;

// Define other models and associations
db.user = require("./users.model.js")(sequelize, DataTypes);
db.accommodation = require("./accommodations.model.js")(sequelize, DataTypes);
db.event = require("./events.model.js")(sequelize, DataTypes);
db.accommodationBooking = require("./accommodationBookings.model.js")(sequelize, DataTypes);
db.eventBooking = require("./EventBookings.model.js")(sequelize, DataTypes);

// Alojamento: User → AccommodationBookings
db.user.hasMany(db.accommodationBooking, { foreignKey: 'userId', as: 'accommodationBookings' });
db.accommodationBooking.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });

db.accommodation.hasMany(db.accommodationBooking, { foreignKey: 'accommodationId', as: 'bookings' });
db.accommodationBooking.belongsTo(db.accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });

// Evento: User → EventBookings
db.user.hasMany(db.eventBooking, { foreignKey: 'userId', as: 'eventBookings' });
db.eventBooking.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });

db.event.hasMany(db.eventBooking, { foreignKey: 'eventId', as: 'bookings' });
db.eventBooking.belongsTo(db.event, { foreignKey: 'eventId', as: 'event' });

// Many-to-Many: Users ↔ Events (interesse)
db.user.belongsToMany(db.event, { through: 'UserEventInterest', foreignKey: 'userId', otherKey: 'eventId' });
db.event.belongsToMany(db.user, { through: 'UserEventInterest', foreignKey: 'eventId', otherKey: 'userId' });

// ASSOCIAÇÃO: User → Accommodations (criador do alojamento)
db.user.hasMany(db.accommodation, { foreignKey: 'createdByUserId', as: 'accommodations' });
db.accommodation.belongsTo(db.user, { foreignKey: 'createdByUserId', as: 'creator' });

// ASSOCIAÇÃO: User → Events (criador do evento)
db.user.hasMany(db.event, { foreignKey: 'createdByUserId', as: 'createdEvents' });
db.event.belongsTo(db.user, { foreignKey: 'createdByUserId', as: 'creator' });



// Optionally: SYNC
(async () => {
    try {;
        //await sequelize.sync({ force: true });
        await sequelize.sync({ alter: true });
        //await sequelize.sync();

        clear()
        console.log('DB is successfully synchronized');
    } catch (error) {
        console.error('Error synchronizing the DB:', error);
    }
})();

module.exports = db;
