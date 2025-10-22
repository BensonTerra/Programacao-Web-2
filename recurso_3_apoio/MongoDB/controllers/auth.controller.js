const jwt = require("jsonwebtoken");    //JWT tokens (sign(), verify()) 

const db = require('../models/db.js');  // Import the database connection


let verifyToken = async (req, res, next) => {
    try {
        // search token in headers most commonly used for authorization
        const header = req.headers['x-access-token'] || req.headers.authorization;
        if (typeof header == 'undefined') {
            let error = new Error(`No token provided!`)
            error.statusCode = 400;
            return next(error);
        }

        const bearer = header.split(' '); // Authorization header format: Bearer <token>
        const token = bearer[1];

        let decoded = jwt.verify(token, process.env.SECRET);
        req.loggedUserId = decoded.id; // save user ID into request object

        next();

    } catch (err) {
        let error = new Error( "Unauthorized!")
        error.statusCode = 401;
        next(error);
    }
};

let login = async (req, res, next) => {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            let error = new Error("Must provide email and password.")
            error.statusCode = 400;
            return next(error);
        }

        // check if the user exists in the database
        let user = await db.user.findOne({  email: req.body.email  }).exec(); //get user data from DB
        if (!user) {
            let error = new Error("Email not found.")
            error.statusCode = 400;
            return next(error);
        }

        // check if the password matches the one in the database
        const check = req.body.password == user.password;
        if (!check) {
            let error = new Error("Invalid credentials!")
            error.statusCode = 401;
            return next(error);
        }


        // sign the given payload (user ID) into a JWT payload
        const token = jwt.sign({ id: user.id },
            process.env.SECRET, {
            expiresIn: '3h' // token expires in 3hours
        });
        return res.status(200).json({ accessToken: token });

    } catch (err) {
        next(err);
    };

};



module.exports = {
    verifyToken, login
}