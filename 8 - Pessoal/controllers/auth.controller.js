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
exports.isFacilitador = async (req, res, next) => {
    if (req.loggedUserRole === "facilitador")
        return next();

    next(new ErrorHandler(403, "This request requires ADMIN role!"))
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

exports.changeRoleToAdmin = async (req, res, next) => {
    try {
        // Apenas administradores podem promover outros usuários
        if (req.loggedUserRole !== 'admin') {
            throw new ErrorHandler(403, "Only admins can change user roles.");
        }

        const userId = req.params.userID;

        const user = await User.findByPk(userId);
        if (!user) {
            throw new ErrorHandler(404, "User not found.");
        }

        // Atualiza o papel do usuário para 'admin'
        user.role = 'admin';
        await user.save();

        res.status(200).json({ message: `User ${user.email} is now an admin.` });

    } catch (err) {
        next(err);
    }
};

