const { dbConfig } = require('../utils/config.js');
const { Sequelize, DataTypes } = require('sequelize');
const clear = require('clear');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
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
db.tutorial = require("./tutorials.model.js")(sequelize, DataTypes);
db.order = require("./order.model.js")(sequelize, DataTypes);
db.ingPerOrd = require("./ingredients_per_order.model.js")(sequelize, DataTypes);

// Optionally: SYNC
(async () => {
    try {
        // await sequelize.sync({ force: true });
        await sequelize.sync({ alter: true });
        // await sequelize.sync();
        clear();
        console.log('DB is successfully synchronized');
    } catch (error) {
        console.error('Error synchronizing the DB:', error);
    }
})();

module.exports = db;
