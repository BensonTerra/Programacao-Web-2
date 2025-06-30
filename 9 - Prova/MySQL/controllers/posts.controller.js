const db = require('../models/db.js'); // Import the database connection
const Post = db.Post; // Import the Post model from the database connection

const { Op } = require('sequelize'); // necessary operators for Sequelize 

const { ErrorHandler } = require("../utils/error.js"); // Import the ErrorHandler class for error handling

// list all posts with pagination and filtering
let getAllPosts = async (req, res, next) => {

    try {
        const { title, published, sort, order, page = 1, limit = 10 } = req.query;
        // filtering by title and published status
        const where = {};
        if (published !== undefined) {
            // validate published value
            if (published !== 'true' && published !== 'false') 
                throw new ErrorHandler(400, `Invalid value for published: ${published}. It should be either 'true' or 'false'.`);
            
            where.published = published === 'true'; // convert to boolean
        }
        if (title) where.title = { [Op.like]: `%${title}%` }; // use Sequelize's Op.like for partial matching

        // validate sort and order values
        if (sort && sort !== 'views') 
           throw new ErrorHandler(400, `Invalid value for sort: ${sort}. It should be 'views'.`);
           
        if (order && order !== 'asc' && order !== 'desc') 
           throw new ErrorHandler(400, `Invalid value for order: ${order}. It should be either 'asc' or 'desc'.`);

        // sort and order options must be passed together
        if ((sort && !order) || (!sort && order)) 
            throw new ErrorHandler(400, `Both sort and order must be provided together.`);

        // ordering by number of views: ?sortBy=views&order=asc|desc
        const sortField = sort === 'views' ? 'views' : 'id'; // by default sort by id
        const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

        // validate page and limit values
        if (isNaN(page) || page < 1) 
            throw new ErrorHandler(400, `Invalid value for page: ${page}. It should be a positive integer.`);
        
        if (isNaN(limit) || limit < 1) 
            throw new ErrorHandler(400, `Invalid value for limit: ${limit}. It should be a positive integer.`);

        let posts = await Post.findAndCountAll({
            where,
            order: [[sortField, sortOrder]],
            limit: +limit,
            offset: (+page - 1) * +limit,
            raw: true
        })

        // map HATEOAS links to each one of the posts
        posts.rows.forEach(post => {
            post.links = [
                { rel: "self", href: `/posts/${post.id}`, method: "GET" },
                { rel: "delete", href: `/posts/${post.id}`, method: "DELETE" },
                { rel: "modify", href: `/posts/${post.id}`, method: "PUT" },
                // link to add tags to the post
                { rel: "add-tags", href: `/posts/${post.id}/tags`, method: "POST" },
            ]
        });

        return res.status(200).json({
            totalPages: Math.ceil(posts.count / limit),
            currentPage: page ? page : 0,
            total: posts.count,
            data: posts.rows,
            links: [
                { "rel": "add-post", "href": `/posts`, "method": "POST" },
                // ... JS spread operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
                // only add the previous page link if the current page is greater than 1
                ...(page > 1 ? [{ "rel": "previous-page", "href": `/posts?limit=${limit}&page=${page - 1}`, "method": "GET" }] : []),
                // only add the next page link if there are more pages to show
                ...(posts.count > page * limit ? [{ "rel": "next-page", "href": `/posts?limit=${limit}&page=${+page + 1}`, "method": "GET" }] : [])
            ]
        });
    }
    catch (err) {
        next(err); // Pass the error to the next middleware
    }
}

let getPostById = async (req, res, next) => {
    try {
        // OLD: const post = await Post.findByPk(req.params.id, { raw: true });

        let post = await Post.findByPk(req.params.id, {
            attributes: { exclude: ['author'] }, //  NEW: exclude the author field (FK) from the Post model
            // NEW:  EAGER LOADING
            include: [ // NEW: include the author and tags names
                {
                    model: db.User,
                    as: 'creator', // alias for the User model
                    attributes: ['id', 'username']
                },
                {
                    model: db.Tag,
                    through: { attributes: [] } // omite PostTags
                }
            ],
            //raw: true // do NOT use raw: true, it will not work with eager loading
        });

        // If not found, return 404
        if (!post) 
            throw new ErrorHandler(404, `Cannot find any POST with ID ${req.params.id}.`);    

        // convert the post to a plain object
        post = post.toJSON();
        post.Tags = post.Tags.map(tag => tag.name); // convert tags to an array of names
        // map HATEOAS links to the post
        post.links = [
            { rel: "modify", href: `/posts/${post.id}`, method: "PUT" },
            { rel: "delete", href: `/posts/${post.id}`, method: "DELETE`" },
            //  NEW: links to delete tags from the post
            ...post.Tags.map(tag => ({ rel: `delete-tag-${tag}`, href: `/posts/${post.id}/tags/${tag}`, method: "DELETE" })),
        ]

        res.status(200).json(post); // Return the found post
    }
    catch (err) {
        next(err); // Pass the error to the next middleware
    }
}

let addPost = async (req, res, next) => {
    try {
        // NEW: check if body has author field (mandatory)
        if (req.body.author === undefined) {
            let error = new Error(`Missing required field: author.`);
            error.statusCode = 400;
            return next(error); // Pass the error to the next middleware
        }

        // NEW: check if author exists in the database
        const author = await db.User.findByPk(req.body.author);
        if (author === null) 
            throw new ErrorHandler(404, `Cannot find any USER with ID ${req.body.author}.`);

        const post = await Post.create(req.body);
        res.status(201).json({
            msg: "Post successfully created.",
            //add HATEOAS links to the created post
            links: [
                { rel: "self", href: `/posts/${post.id}`, method: "GET" },
                { rel: "delete", href: `/posts/${post.id}`, method: "DELETE" },
                { rel: "modify", href: `/posts/${post.id}`, method: "PUT" },
                // NEW: link to add tags to the post
                { rel: "add-tags", href: `/posts/${post.id}/tags`, method: "POST" },

            ]
        });
    } catch (err) {
        // Handle Sequelize validation error or other errors to handler middleware
        next(err)
    }

}

let updatePost = async (req, res, next) => {
    try {
        // sequelize update method allows PARTIAL updates, so we NEED to check for missing fields    
        let missingFields = [];
        if (req.body.title === undefined) missingFields.push('title');
        if (req.body.description === undefined) missingFields.push('description');

        if (missingFields.length > 0) 
           throw new ErrorHandler(400, `Missing required fields: ${missingFields.join(', ')}`);
          
        // update post in database given its id, using the Post model
        const post = await Post.findByPk(req.params.id);
        // If not found, return 404 
        if (!post) 
            throw new ErrorHandler(404, `Cannot find any POST with ID ${req.params.id}.`);

        // update the post with the new data
        await post.update(req.body);

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
        // delete a post in database given its id, using the Post model
        let result = await Post.destroy({ where: { id: req.params.id } });
        // the promise returns the number of deleted rows
        if (result == 0) 
           throw new ErrorHandler(404,`Cannot find any POST with ID ${req.params.id}.`);
        
        // send 204 No Content respons
        res.status(204).json();
    }
    catch (err) {
        next(err); // Pass the error to the next middleware
    }
}


let addTagToPost = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);
        // If not found, return 404 
        if (!post) 
            throw new ErrorHandler(404,`Cannot find any POST with ID ${req.params.id}.`);    

        // try to find the tag, given its ID
        let tag = await db.Tag.findByPk(req.params.tag)
        if (tag === null) 
            throw new ErrorHandler(404,`Cannot find any TAG ${req.params.tag}.`);

        let result = await post.addTag(tag); // MIXIN function to add tagsto the post - lazy association

        // result is undefined if the tag already exist in the post
        if (result == undefined) 
            throw new ErrorHandler(409,`Post ${req.params.id} already has tag ${req.params.tag}.`);

        res.json({
            msg: `Tag ${req.params.tag} sucessfully added to Post ${req.params.id}!`
        });

    }
    catch (err) {
        next(err);
    }
}


let deleteTagFromPost = async (req, res, next) => {
    try {
        const post = await Post.findByPk(req.params.id);
        // If not found, return 404 
        if (!post) 
           throw new ErrorHandler(404,`Cannot find any POST with ID ${req.params.id}.`);

        // try to find the tag, given its ID
        let tag = await db.Tag.findByPk(req.params.tag)
        if (tag === null) 
            throw new ErrorHandler(404,`Cannot find any TAG ${req.params.tag}.`);

        let result = await post.removeTag(tag);
        if (result == 0) 
            throw new ErrorHandler(409,`Post ${req.params.id} does not have tag ${req.params.tag}.`);

        res.json({
            msg: `Tag ${req.params.tag} sucessfully removed from Post ${req.params.id}!`
        });
    }
    catch (err) {
        next(err); // Pass the error to the next middleware
    }
}

module.exports = {
    getAllPosts, getPostById,
    addPost, updatePost, deletePost,
    // NEW
    addTagToPost, deleteTagFromPost
}