const db = require("../models/db.js");
const Project = db.project;

exports.getAll = async (req, res, next) => {
    try {
        let users = await Project.findAll({})
        res.status(200).json({ success: true, data: users });
    }
    catch (err) {
        next(err)
    };
};