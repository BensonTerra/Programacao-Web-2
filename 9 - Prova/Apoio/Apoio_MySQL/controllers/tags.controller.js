const db = require('../models/db.js'); // Import the database connection
const Tag = db.Tag; // Import the Tag model from the database connection

const { ErrorHandler } = require("../utils/error.js"); // Import the ErrorHandler class for error handling

// list all tags 
let getAllTags = async (req, res, next) => {

    try {
        let tags = await Tag.findAll();
        return res.status(200).json({
            data: tags,
            links: [
                { "rel": "add-tag", "href": `/tags`, "method": "POST" },
            ]
        });
    }
    catch (err) {
        next(err);
    }
}


let addTag = async (req, res, next) => {
    try {
        const tag = await Tag.create(req.body);
        res.status(201).json({
            msg: "Tag successfully created."
        });
    } catch (err) {
        next(err)
    }

}


module.exports = {
    getAllTags,
    addTag
}