const db = require("../models/db.js");
const User = db.user;

exports.getAll = async (req, res, next) => {
    try {
        let users = await User.findAll({})
        res.status(200).json({ success: true, data: users });
    }
    catch (err) {
        next(err)
    };
};