const db = require('../models/db.js'); // Import the database connection
const User = db.User; // Import the User model from the database connection

const { ErrorHandler } = require("../utils/error.js"); // Import the ErrorHandler class for error handling

// get all posts from a user 
let getPostsFromUser = async (req, res, next) => {

    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'role'],
        });

        // If not found, return 404
        if (!user) 
            throw new ErrorHandler(404,`Cannot find any USER with ID ${req.params.id}.`);

        // lazy loading 
        const posts = await user.getPosts({attributes: { exclude: ['author'] }})

        // map HATEOAS links to each one of the posts
        posts.forEach(post => {
            post.dataValues.links = [
                { rel: "self", href: `/posts/${post.id}`, method: "GET" },
                { rel: "delete", href: `/posts/${post.id}`, method: "DELETE" },
                { rel: "modify", href: `/posts/${post.id}`, method: "PUT" },
                // link to add tags to the post
                { rel: "add-tags", href: `/posts/${post.id}/tags`, method: "POST" },
            ]
        });

        user.dataValues.posts = posts; // add posts to the user object

        return res.status(200).json({
            data: user
        });
    }
    catch (err) {
        next(err);
    }
}



module.exports = {
    getPostsFromUser
}