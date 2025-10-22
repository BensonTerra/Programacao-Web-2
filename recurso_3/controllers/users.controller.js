const db = require('../models/db.js');
const User = db.User;

const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.username) {
            filter.username = new RegExp(escapeRegex(req.query.username), 'i');
        }
        if (req.query.role) {
            filter.role = new RegExp(escapeRegex(req.query.role), 'i');
        }
        const users = await User.find(filter).select('-password -__v').exec();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

exports.getOneUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password -__v').exec();
        if (!user) return res.status(404).json({ message: `User with id ${req.params.id} not found.` });
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

exports.updateOneUser = async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username: req.body.username, role: req.body.role },
            { new: true, runValidators: true, context: 'query' }
        ).select('-password -__v');
        if (!updatedUser) return res.status(404).json({ message: `User with id ${req.params.id} not found.` });
        res.status(200).json(updatedUser);
    } catch (err) {
        next(err);
    }
};

exports.deleteOneUser = async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id).select('-password -__v');
        if (!deletedUser) return res.status(404).json({ message: `User with id ${req.params.id} not found.` });
        res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (err) {
        next(err);
    }
};

exports.getPostsFromUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id).select('-password -__v').exec();
        if (!user) return res.status(404).json({ message: `User with id ${req.params.id} not found.` });

        const posts = await db.Post.find({ author: req.params.id }).select('-__v -author').exec();

        const postsWithLinks = posts.map(post => ({
            ...post.toJSON(),
            links: [
                { rel: "self", href: `/posts/${post._id}`, method: "GET" },
                { rel: "modify", href: `/posts/${post._id}`, method: "PUT" },
                { rel: "delete", href: `/posts/${post._id}`, method: "DELETE" }
            ]
        }));

        user = user.toJSON();
        user.posts = postsWithLinks;

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};
