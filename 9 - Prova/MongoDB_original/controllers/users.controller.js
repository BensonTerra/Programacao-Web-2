const db = require('../models/db.js'); // Import the database connection

// get all posts from a user 
let getPostsFromUser = async (req, res, next) => {

    try {
        let user = await db.User.findById(req.params.id)
            .select('-password -__v') // exclude the __v and password fields 
            .exec()

        // If not found, return 404
        if (!user) {
            let error = new Error(`Cannot find any USER with ID ${req.params.id}.`);
            error.statusCode = 404;
            return next(error); // Pass the error to the next middleware
        }

        // "lazy loading" posts from the user
        const posts = await db.Post.find({ author: req.params.id })
            .select('-__v -author') // exclude the author and __v fields
            .exec();

        // map HATEOAS links to each one of the posts
        const postsWithLinks = posts.map(post => ({
            ...post.toJSON(), // spread operator to copy all properties of the post object
            links: [
                { rel: "self", href: `/posts/${post._id}`, method: "GET" },
                { rel: "modify", href: `/posts/${post._id}`, method: "PUT" },
                { rel: "delete", href: `/posts/${post._id}`, method: "DELETE`" }
            ]
        }));

        user = user.toJSON(); // convert the user to a plain object
        user.posts = postsWithLinks; // add posts to the user object

        return res.status(200).json(user);
    }
    catch (err) {
        next(err);
    }
}



module.exports = {
    getPostsFromUser
}