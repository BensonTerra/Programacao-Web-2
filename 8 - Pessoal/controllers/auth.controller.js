const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const User = db.user;

exports.verifyToken = (req, res, next) => {
    try {
        const header = req.headers['x-access-token'] || req.headers.authorization;

        if (typeof header == 'undefined')
            throw new ErrorHandler(401, "No token provided!");

        let token, bearer = header.split(' ');

        if (bearer.length == 2)
            token = bearer[1];
        else
            token = header;

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

/*--------------------------------------------------------------------------------------------------------------*/
/*                               Verficar role do usuario logado                                                */
/*--------------------------------------------------------------------------------------------------------------*/

exports.isAdmin = async (req, res, next) => {
    if (req.loggedUserRole === "admin")
        return next();

    next(new ErrorHandler(403, "This request requires ADMIN role!"))
};

exports.isFacilitador = async (req, res, next) => {
    if (req.loggedUserRole === "facilitador")
        return next();

    next(new ErrorHandler(403, "This request requires FACILITADOR role!"))
};

exports.isAdminOrFacilitador = async (req, res, next) => {
    if (req.loggedUserRole === "admin" || req.loggedUserRole === "facilitador")
        return next();

    next(new ErrorHandler(403, "This request requires ADMIN or FACILITADOR role!"))
};
