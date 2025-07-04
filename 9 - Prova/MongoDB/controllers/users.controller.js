const clear = require('clear');
const db = require('../models/db.js'); // Import the database connection

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// get all posts from a user 
let getPostsFromUser = async (req, res, next) => {
    try {
        clear()
        let user = await db.User.findById(req.params.id)
            .select('-password -__v')
            .exec();

        if (!user) {
            let error = new Error(`Cannot find any USER with ID ${req.params.id}.`);
            error.statusCode = 404;
            return next(error);
        }

        const posts = await db.Post.find({ author: req.params.id })
            .select('-__v -author')
            .exec();

        const postsWithLinks = posts.map(post => ({
            ...post.toJSON(),
            links: [
                { rel: "self", href: `/posts/${post._id}`, method: "GET" },
                { rel: "modify", href: `/posts/${post._id}`, method: "PUT" },
                { rel: "delete", href: `/posts/${post._id}`, method: "DELETE`" }
            ]
        }));

        user = user.toJSON();
        user.posts = postsWithLinks;

        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

let getAllUsers = async (req, res, next) => {
    try {
        clear()
        const { username, role } = req.query;
        const query = {};

        if (username) query.username = { $regex: escapeRegex(username), $options: 'i' };
        if (role)     query.role     = { $regex: escapeRegex(role),     $options: 'i' };

        console.log("Query MongoDB:", query); // debug

        const users = await db.User.find(query).select('-password -__v');

        return res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPostsFromUser,
    getAllUsers
};