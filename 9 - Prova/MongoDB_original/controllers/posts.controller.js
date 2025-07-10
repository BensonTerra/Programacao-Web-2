const db = require('../models/db.js'); // Import the database connection

// list all posts with pagination and filtering
let getAllPosts = async (req, res, next) => {

    try {
        const { title, published, sort, order, page = 1, limit = 10 } = req.query;
        // filtering by title and published status
        const query = {};
        if (published !== undefined) {
            // validate published value
            if (published !== 'true' && published !== 'false') {
                let error = new Error(`Invalid value for published: ${published}. It should be either 'true' or 'false'.`);
                error.statusCode = 400;
                return next(error); // Pass the error to the next middleware
            }
            query.published = published === 'true'; // convert string to boolean
        }
        if (title) query.title = new RegExp(title, 'i'); // case insensitive search

        // validate sort and order values
        if (sort && sort !== 'views') {
            let error = new Error(`Invalid value for sort: ${sort}. It should be 'views'.`);
            error.statusCode = 400;
            return next(error); // Pass the error to the next middleware
        }
        if (order && order !== 'asc' && order !== 'desc') {
            let error = new Error(`Invalid value for order: ${order}. It should be either 'asc' or 'desc'.`);
            error.statusCode = 400;
            return next(error); // Pass the error to the next middleware
        }

        if (sort && sort !== 'views') {
            let error = new Error(`Invalid value for sort: ${sort}. It should be 'views'.`);
            error.statusCode = 400;
            return next(error); // Pass the error to the next middleware
        }

        // validate page and limit values
        if (isNaN(page) || page < 1) {
            let error = new Error(`Invalid value for page: ${page}. It should be a positive integer.`);
            error.statusCode = 400;
            return next(error); // Pass the error to the next middleware
        }
        if (isNaN(limit) || limit < 1) {
            let error = new Error(`Invalid value for limit: ${limit}. It should be a positive integer.`);
            error.statusCode = 400;
            return next(error); // Pass the error to the next middleware
        }

        const total = await db.Post.countDocuments(query);
        const postQuery = db.Post.find(query)
            .select('-__v') // exclude the __v field from the result
            .skip((page - 1) * limit)
            .limit(Number(limit))

        if (sort && order) {
            postQuery.sort({ [sort]: order === 'desc' ? -1 : 1 }); // sort by views in ascending or descending order 
        }

        const posts = await postQuery;

        // map HATEOAS links to each one of the posts
        const postsWithLinks = posts.map(post => ({
            ...post.toJSON(), // spread operator to copy all properties of the post object
            links: [
                { rel: "self", href: `/posts/${post._id}`, method: "GET" },
                { rel: "modify", href: `/posts/${post._id}`, method: "PUT" },
                { rel: "delete", href: `/posts/${post._id}`, method: "DELETE`" }
            ]
        }));

        // pagination links
        const links = [];
        if ((page - 1) * limit > 0) {
            links.push({ rel: "previous", href: `/posts?page=${page - 1}&limit=${limit}`, method: "GET" });
        }
        if (page * limit < total) {
            links.push({ rel: "next", href: `/posts?page=${Number(page) + 1}&limit=${limit}`, method: "GET" });
        }

        return res.status(200).json({
            totalPages: Math.ceil(total / limit),
            currentPage: page ? page : 0,
            total: total,
            data: postsWithLinks,
            links: [
                { "rel": "add-post", "href": `/posts`, "method": "POST" },
                // ... JS spread operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
                // only add the previous page link if the current page is greater than 1
                ...(page > 1 ? [{ "rel": "previous-page", "href": `/posts?limit=${limit}&page=${page - 1}`, "method": "GET" }] : []),
                // only add the next page link if there are more pages to show
                ...(total > page * limit ? [{ "rel": "next-page", "href": `/posts?limit=${limit}&page=${+page + 1}`, "method": "GET" }] : [])
            ]
        });
    }
    catch (err) {
        next(err); // Pass the error to the next middleware
    }
}

let getPostById = async (req, res, next) => {
    try {
        const post = await db.Post.findById(req.params.id)
            .select('-__v') // exclude the __v field from the result
            // populate the author field, without the password field
            .populate({ path: "author", select: "-password" })
            .exec();

        if (post == null) {
            let error = new Error(`Cannot find any POST with ID ${req.params.id}.`);
            error.statusCode = 404;
            return next(error); // Pass the error to the next middleware
        }

        // convert the post to a plain object
        const postJSON = post.toJSON();
        postJSON.links = [
            { rel: "modify", href: `/posts/${post.id}`, method: "PUT" },
            { rel: "delete", href: `/posts/${post.id}`, method: "DELETE`" }
        ]

        res.status(200).json(postJSON); // Return the found post
    }
    catch (err) {
        next(err); // Pass the error to the next middleware
    }
}

let addPost = async (req, res, next) => {
    try {
        // validate author field (reference to User model)
        const author = await db.User.findById(req.body.author);
        if (!author) {
            let error = new Error(`Cannot find the author (given ID was ${req.body.author}).`);
            error.statusCode = 404;
            return next(error); // Pass the error to the next middleware
        }

        const post = new db.Post(req.body); // create a new post object using the Post model
        let newPost = await post.save();

        res.status(201).json({
            msg: "Post successfully created.",
            //add HATEOAS links to the created post
            links: [
                { rel: "self", href: `/posts/${newPost._id}`, method: "GET" },
                { rel: "delete", href: `/posts/${newPost._id}}`, method: "DELETE" },
                { rel: "modify", href: `/posts/${newPost._id}}`, method: "PUT" },
            ]
        });
    } catch (err) {
        // Handle validation error or other errors to handler middleware
        next(err)
    }

}

let updatePost = async (req, res, next) => {
    try {
        // update method allows partial updates, so we NEED to check for missing fields    
        let missingFields = [];
        if (req.body.title === undefined) missingFields.push('title');
        if (req.body.description === undefined) missingFields.push('description');

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // update post in database given its id, using the Post model
        const post = await db.Post.findByIdAndUpdate(req.params.id, req.body,
            {
                runValidators: true //force validations of the update operation against the model's schema
            }
        );
        // If not found, return 404 
        if (!post) {
            let error = new Error(`Cannot find any POST with ID ${req.params.id}.`);
            error.statusCode = 404;
            return next(error);
        }

        // send 204 No Content response
        res.status(204).json();
    }
    catch (err) {
        // Handle Sequelize validation error or other errors to handler middleware
        next(err)
    }
}

let deletePost = async (req, res, next) => {
    try {
        // delete a post in database given its id
        const post = await db.Post.findByIdAndDelete(req.params.id);
        // If not found, return 404 
        if (!post) {
            let error = new Error(`Cannot find any POST with ID ${req.params.id}.`);
            error.statusCode = 404;
            return next(error);
        }
        // send 204 No Content response
        res.status(204).json()
    }
    catch (err) {
        next(err); // Pass the error to the next middleware
    }
}


module.exports = {
    getAllPosts, getPostById,
    addPost, updatePost, deletePost
}