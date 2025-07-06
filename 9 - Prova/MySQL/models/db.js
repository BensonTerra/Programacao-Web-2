const { dbConfig } = require('../utils/config.js');
const { Sequelize, DataTypes } = require('sequelize');
const clear = require('clear');

// Conexão temporária SEM database para checar e criar
const tempSequelize = new Sequelize('', dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    logging: false
});

const createDatabaseIfNotExists = async () => {
    try {
        const [results] = await tempSequelize.query(
            `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbConfig.DB}'`
        );

        if (results.length === 0) {
            await tempSequelize.query(
                `CREATE DATABASE \`${dbConfig.DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
            );
            console.log(`✅ Banco de dados "${dbConfig.DB}" criado.`);
        }/* else {
            console.log(`ℹ️ Banco de dados "${dbConfig.DB}" já existe.`);
        }*/

        await tempSequelize.close();
    } catch (err) {
        console.error('❌ Erro ao verificar ou criar o banco de dados:', err);
        process.exit(1);
    }
};

// Conexão principal (com database definido)
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    logging: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};
db.sequelize = sequelize;

// Models
db.Post = require('./posts.model.js')(sequelize, Sequelize.DataTypes);
db.User = require('./users.model.js')(sequelize, Sequelize.DataTypes);
db.Tag = require('./tags.model.js')(sequelize, Sequelize.DataTypes);

// Relações
db.User.hasMany(db.Post, { foreignKey: 'author', onDelete: 'CASCADE', allowNull: false });
db.Post.belongsTo(db.User, { foreignKey: 'author', as: 'creator', onDelete: 'CASCADE', allowNull: false });

db.Post.belongsToMany(db.Tag, { through: 'PostTags', foreignKey: 'PostId', otherKey: 'TagId', timestamps: false });
db.Tag.belongsToMany(db.Post, { through: 'PostTags', foreignKey: 'TagId', otherKey: 'PostId', timestamps: false });

// Execução principal
(async () => {
    try {
        clear();
        await createDatabaseIfNotExists();
        await sequelize.authenticate();
        console.log("✅ Connected to the database MySQL!");

        //await sequelize.sync({ force: true });
        await sequelize.sync({ alter: true });
        //await sequelize.sync();
        
        console.log("✅ DB is successfully synchronized");
    } catch (error) {
        console.error('❌ Erro geral:', error);
        process.exit(1);
    }
})();

module.exports = db;
