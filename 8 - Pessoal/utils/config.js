const dbConfig = {
     // read DB credencials from environment variables
     HOST: process.env.DB_HOST,
     PORT: process.env.DB_PORT || 3306, // default MySQL port
     USER: process.env.DB_USER,
     PASSWORD: process.env.DB_PASSWORD,
     DB: process.env.DB_NAME
     // NEW
     ,
     dialect: "mysql",
     // pool is optional, it will be used for Sequelize connection pool configuration
     pool: {
          max: 5,   //maximum number of connections in pool
          min: 0,   //minimum number of connections in pool
          acquire: 30000,     //maximum time, in milliseconds, that pool will try to get connection before throwing error
          idle: 10000    //maximum time, in milliseconds, that a connection can be idle before being released
     }
};

const JWTconfig = { SECRET: process.env.SECRET }

module.exports = {dbConfig, JWTconfig}