const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../../utils/config.js");
const { ErrorHandler } = require("../../utils/error.js");

const db = require("../../models/index.js");
const User = db.user;

const { ValidationError } = require('sequelize');

exports.create = async (req, res, next) => {
    try {
        if (!req.body || !req.body.username || !req.body.password )
            throw new ErrorHandler(400, "Username and password are mandatory");

        // Save user to DB
        let user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            role: req.body.role
        });

        return res.status(201).json({ success: true, msg: "User was registered successfully!" });

    }
    catch (err) {
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    }
};

exports.login = async (req, res, next) => {
    try {
        if (!req.body || !req.body.username || !req.body.password)
            throw new ErrorHandler(400, "Failed! Must provide username and password.");

        let user = await User.findOne({
            where: { username: req.body.username }
        });
        if (!user)
            throw new ErrorHandler(404, "User not found.");

        // decrypt psswd from DB and compare with the provided psswd in request
        // tests a string (password in body) against a hash (password in database)​
        const check = bcrypt.compareSync(
            req.body.password, user.password
        );

        if (!check)
            throw new ErrorHandler(401, "Invalid credentials!");

        //UNSAFE TO STORE EVERYTHING OF USER, including PSSWD
        // sign the given payload (user ID) into a JWT payload – builds JWT token, using secret key
        const token = jwt.sign({ id: user.id, role: user.role },
            JWTconfig.SECRET, {
            expiresIn: '24h' // 24 hours
            // expiresIn: '20m' // 20 minutes
            // expiresIn: '1s' // 1 second
        });
    
        return res.status(200).json({
            success: true,
            accessToken: token
        });

    } catch (err) {
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
};

exports.getAllUsers = async (req, res, next) => {
    try {
        let users = await User.findAll({ attributes: ['id', 'username', 'password' , 'email', 'role'] })
        res.status(200).json({ success: true, data: users });
    }
    catch (err) {
        next(err)
    };
};

exports.getUser = async (req, res, next) => {
    try {
        let user = await User.findByPk(req.params.userID, { attributes: ['id', 'username', 'email', 'role'] })
        if (user == null)
            throw new ErrorHandler(404, "User not found.");

        res.status(200).json({ success: true, data:user});
    }
    catch (err) {
        next(err)
    };
};


