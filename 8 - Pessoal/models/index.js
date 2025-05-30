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
db.events = require("./events.model.js")(sequelize, DataTypes);
db.booking = require("./bookings.model.js")(sequelize, DataTypes);

db.user.hasMany(db.booking, { foreignKey: 'userId', as: 'bookings' });
db.booking.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });

db.events.hasMany(db.booking, { foreignKey: 'eventId', as: 'bookings' });
db.booking.belongsTo(db.events, { foreignKey: 'eventId', as: 'event' });

db.accommodation.hasMany(db.booking, { foreignKey: 'accommodationId', as: 'bookings' });
db.booking.belongsTo(db.accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });

db.user.belongsToMany(db.events, { through: 'UserEventInterest', foreignKey: 'userId', otherKey: 'eventId' });
db.events.belongsToMany(db.user, { through: 'UserEventInterest', foreignKey: 'eventId', otherKey: 'userId' });


// Optionally: SYNC
(async () => {
    try {
        //await sequelize.sync({ force: true });
        //await sequelize.sync({ alter: true });
        // await sequelize.sync();
        clear();
        console.log('DB is successfully synchronized');
    } catch (error) {
        console.error('Error synchronizing the DB:', error);
    }
})();

module.exports = db;
