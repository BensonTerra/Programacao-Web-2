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

db.User = require("./users.model.js")(sequelize, DataTypes);

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
