const { dbConfig } = require('../utils/config.js');
const { Sequelize, DataTypes } = require('sequelize');
const clear = require('clear')

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect
    ,
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
        console.log('Connection do DB has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
    }
})();

const db = {};
db.sequelize = sequelize;

/*----------------------------------------------------------------*/
/*
db.books = require("./book.model.js")(sequelize, DataTypes);
db.bookGenres  = require("./bookGenre.model.js")(sequelize, DataTypes);
db.genres = require("./genre.model.js")(sequelize, DataTypes)
*/
/*----------------------------------------------------------------*/
/*
db.books.hasMany(db.genres, { onDelete: 'CASCADE' });
db.genres.belongsTo(db.books);

db.books.belongsToMany(db.genres, {
    through: 'booksGenres', timestamps: false
});
db.genres.belongsToMany(db.books, {
    through: 'booksGenres', timestamps: false
});
*/
/*----------------------------------------------------------------*/
// optionally: SYNC
(async () => {
    try {
        // await sequelize.sync({ force: true });
        await sequelize.sync({ alter: true });
        // await sequelize.sync();
        clear()
        console.log('DB is successfully synchronized')
    } catch (error) {
        console.log(error)
    }
})();

module.exports = db;
