const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models");
const User = db.user;

exports.verifyToken = (req, res, next) => {
    try {
        // search token can be in the headers most commonly used for authentication
        const header = req.headers['x-access-token'] || req.headers.authorization;

        if (typeof header == 'undefined')
            throw new ErrorHandler(401, "No token provided!");

        // Authorization header format: Bearer <token>
        let token, bearer = header.split(' ');
        if (bearer.length == 2)
            token = bearer[1];
        else
            token = header;

        //jsonwebtoken's verify() function

        let decoded = jwt.verify(token, JWTconfig.SECRET);
        req.loggedUserId = decoded.id;
        req.loggedUserRole = decoded.role;
        next();

    } catch (err) {
        if (err.name === 'TokenExpiredError')
            err = new ErrorHandler(401, "Your token has expired! Please login again.");

        if (err.name === 'JsonWebTokenError')
            err = new ErrorHandler(401, "Malformed JWT! Please login again.");

        return next(err)
    }
};

exports.isAdmin = async (req, res, next) => {
    if (req.loggedUserRole === "admin")
        return next();

    next(new ErrorHandler(403, "This request requires ADMIN role!"))
};

exports.isAdminOrLoggedUser = async (req, res, next) => {
    if (req.loggedUserRole === "admin" || req.loggedUserId == req.params.userID)
        return next();

    next(new ErrorHandler(403, "This request requires an ADMIN Role or you can only see you own data!"));
};


