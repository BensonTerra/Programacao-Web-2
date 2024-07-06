const db = require("../models/index.js");
const { ErrorHandler } = require("../utils/error.js");

const Tag = db.tag;

const { ValidationError } = require('sequelize');

// Display list of all tags
exports.findAll = async (req, res, next) => {
    try {
        // try to find the tutorial, given its ID
        let tags = await Tag.findAll();

        res.status(200).json({
            success: true, 
            data: tags,
            links: [{ "rel": "create-tag", "href": `/tags`, "method": "POST" }]
        });
    }
    catch (err) {
        next(err)
    }
};

// Handle tag creation
exports.create = async (req, res, next) => {
    try {
        // save Tag in the database
        let newTag = await Tag.create(req.body);
        return res.status(201).json({
            success: true,
            msg: `Tag successfully created.`,
            links: [
                { "rel": "all", "href": `/tags`, "method": "GET" },
            ]
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
};



