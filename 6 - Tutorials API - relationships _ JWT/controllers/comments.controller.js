const db = require("../models/index.js");
const { ErrorHandler } = require("../utils/error.js");

const Tutorial = db.tutorial;
const Comment = db.comment;

// necessary for LIKE operator
const { ValidationError } = require('sequelize');
const clear = require('clear')


exports.findTutorial = async (req, res, next) => {
    try {
        let tutorial = await Tutorial.findByPk(req.params.idT, {
            include: [{ model: db.comment, attributes: ['id', 'text'] }]
        });

        if (!tutorial) throw new ErrorHandler(404, `Cannot find any tutorial with ID ${req.params.idT}.`);

        req.tutorial = tutorial;
        next();
    } catch (err) {
        next(err);
    }
};


exports.isAuthor = async (req, res, next) => {
    try {
        // try to find the comment, given its ID
        req.comment = await Comment.findByPk(req.params.idC)
        if (req.comment === null)
            throw new ErrorHandler(404, `Cannot find any comment with ID ${req.params.idC}.`);

        let response = await req.tutorial.hasComment(req.comment)
        if (!response)
            throw new ErrorHandler(404, `Tutorial ${req.params.idT} does have comment with ID ${req.params.idC}.`);

        if (req.loggedUserId == req.comment.author)
            return next();
        else
            throw new ErrorHandler(403, "You can only access your own comments!");
    }
    catch (err) {
        next(err)
    }
};

// Display list of all comments for a given tutorial
// GET /tutorials/:idT/comments 
exports.findAllComments = async (req, res, next) => {
    try {
        let comments = await req.tutorial.getComments({
            attributes: ['id', 'text', 'author'],
            raw: true
        });

        comments.forEach(comment => {
            comment.links = [
                { rel: "modify", href: `/tutorials/${req.params.idT}/comments/${comment.id}`, method: "PATCH" },
                { rel: "delete", href: `/tutorials/${req.params.idT}/comments/${comment.id}`, method: "DELETE" },
            ];
        });

        res.status(200).json({
            success: true,
            tutorial: req.params.idT,
            data: comments,
        });
    } catch (err) {
        next(err);
    }
};

exports.findOneComment = async (req, res, next) => {
    try {
        clear();
        let comments = await req.tutorial.getComments({
            attributes: ['id', 'text', 'author'],
            raw: true
        });

        let comment = comments.find(comment => comment.id == req.params.idC);

        if (comment) {
            comment.links = [
                { rel: "modify", href: `/tutorials/${req.params.idT}/comments/${req.params.idC}`, method: "PATCH" },
                { rel: "delete", href: `/tutorials/${req.params.idT}/comments/${req.params.idC}`, method: "DELETE" },
            ];
        }

        res.status(200).json({
            success: true,
            tutorial_id: req.params.idT,
            comment_id: req.params.idC,
            data: comment,
        });
    } catch (err) {
        next(err);
    }
}


// Handle comment creation: 
// POST /tutorials/:idT/comments 
//  BODY: text(mandatory)
exports.create = async (req, res, next) => {
    console.clear()
    try {
        // save Comment in the database
        let newComment = await Comment.create({
            text: req.body.text,
            TutorialId: req.params.idT,
            author: req.loggedUserId
        });
        console.log(newComment);

        res.status(201).json({
            success: true,
            msg: `Comment added to tutorial with ID ${req.params.idT}.`,
            URL: `/tutorials/${req.params.idT}/comments/${newComment.id}`
        });

        // Adiciona return para garantir que o bloco catch não seja executado
        return;
    }
    catch (err) {
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));

    };
};

exports.update = async (req, res, next) => {
    try {
        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await Comment.update({ text: req.body.text }, { where: { id: req.params.idC } })

        if (affectedRows[0] === 0) // check if the tutorial was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true, msg: `No updates were made on comment with ID ${req.params.idC}.`
            });

        res.json({
            success: true,
            msg: `Comment with ID ${req.params.idC} was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
};

exports.delete = async (req, res, next) => {
    try {
        await Comment.destroy({ where: { id: req.params.idC } })
        return res.status(200).json({
            success: true, msg: `Comment with id ${req.params.idC} was successfully deleted!`
        });

    }
    catch (err) {
        next(err)
    };
};
