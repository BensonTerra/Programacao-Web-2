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

//export TUTORIAL model
db.tutorial = require("./tutorials.model.js")(sequelize, DataTypes);
//export COMMENT model
db.comment = require("./comments.model.js")(sequelize, DataTypes);
//export TAG model
db.tag = require("./tags.model.js")(sequelize, DataTypes);
//export USER model
db.user = require("./users.model.js")(sequelize, DataTypes);

// recurso
db.book = require("./recursoModels/books.model.js")(sequelize, DataTypes);


//define the relationships

// 1:N - 1 tutorial, N comments
// if tutorial is deleted, delete all comments associated with it
db.tutorial.hasMany(db.comment, { onDelete: 'CASCADE' });
db.comment.belongsTo(db.tutorial);

//N:M
db.tutorial.belongsToMany(db.tag, {
    through: 'TagsInTutorials', timestamps: false
});
db.tag.belongsToMany(db.tutorial, {
    through: 'TagsInTutorials', timestamps: false
});

// 1:N - 1 user, N comments
db.comment.belongsTo(db.user, {foreignKey: "author"});
db.user.hasMany(db.comment, {foreignKey: "author"});

// optionally: SYNC
(async () => {
    try {
        // await sequelize.sync({ force: true });
        await sequelize.sync({ alter: true });
        //  await sequelize.sync();
        clear()
        console.log('DB is successfully synchronized')
    } catch (error) {
        console.log(error)
    }
})();

module.exports = db;
