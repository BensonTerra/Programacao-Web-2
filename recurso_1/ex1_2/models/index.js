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

// Export models
db.book = require("./recursoModels/books.model.js")(sequelize, DataTypes);
db.bookGenre = require("./recursoModels/booksGenres.model.js")(sequelize, DataTypes);
db.genre = require("./recursoModels/genres.model.js")(sequelize, DataTypes);
db.instance = require("./recursoModels/instances.model.js")(sequelize, DataTypes);

// Define associations
db.book.hasMany(db.instance, { foreignKey: 'bookId', as: 'instances', onDelete: 'CASCADE' });
db.instance.belongsTo(db.book, { foreignKey: 'bookId' });

db.book.belongsToMany(db.genre, { through: db.bookGenre, foreignKey: 'bookId', as: 'genres' });
db.genre.belongsToMany(db.book, { through: db.bookGenre, foreignKey: 'genreName' });

// Define other models and associations
db.tutorial = require("./tutorials.model.js")(sequelize, DataTypes);
db.comment = require("./comments.model.js")(sequelize, DataTypes);
db.tag = require("./tags.model.js")(sequelize, DataTypes);
db.user = require("./users.model.js")(sequelize, DataTypes);

// 1:N - 1 tutorial, N comments
db.tutorial.hasMany(db.comment, { onDelete: 'CASCADE' });
db.comment.belongsTo(db.tutorial);

// N:M - tutorial and tag
db.tutorial.belongsToMany(db.tag, { through: 'TagsInTutorials', timestamps: false });
db.tag.belongsToMany(db.tutorial, { through: 'TagsInTutorials', timestamps: false });

// 1:N - 1 user, N comments
db.comment.belongsTo(db.user, { foreignKey: "author" });
db.user.hasMany(db.comment, { foreignKey: "author" });

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
