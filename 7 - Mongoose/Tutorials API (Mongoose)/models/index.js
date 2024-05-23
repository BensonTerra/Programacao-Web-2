const dbConfig = require('../config/db.config.js');
const mongoose = require("mongoose");

const db = {};
db.mongoose = mongoose;

(async () => {
    try {
        console.log(dbConfig.URL)
        await db.mongoose.connect(dbConfig.URL);
        console.log("Connected to the database!");
    } catch (error) {
        console.log("Cannot connect to the database!", error);
        process.exit();
    }
})();

db.tutorials = require("./tutorial.model.js")(mongoose);
db.comments = require("./comment.model.js")(mongoose);

module.exports = db;