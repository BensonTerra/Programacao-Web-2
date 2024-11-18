const db = require("../models/index.js");
const Tutorial = db.tutorials;
const Comment = db.comments;

// Retrieve all Tutorials / find by title
exports.findAll = async (req, res) => {
    const title = req.query.title;
    let condition = title ? { title: new RegExp(title, 'i') } : {};
    const test = await Tutorial.find({comments:{$exists: true,$not:{$size: 0}}})
    try {
        let data = await Tutorial
            .find(condition) //condition: 
            .select('title description published ') // select the fields (it will add _id)
            .select('-__v comments ')
            .exec();
        
        //return res.status(200).json({ success: true, tutorials: test });
        return res.status(200).json({ success: true, tutorials: data });
    }
    catch (err) {
        return res.status(500).json({
            success: false, msg: err.message || "Some error occurred while retrieving the tutorials."
        });
    }
};

// Find a single Tutorial with an id
exports.findOne = async (req, res) => {
    try {
        // to use a full fledge promise you will need to use .exec(): findById or findOne returns a QUERY object, not a document
        const tutorial = await Tutorial.findById(req.params.idT)
            .select('-__v')
            .populate("comments", '-__v')
            .exec();
        // no data returned means there is no tutorial in DB with that given ID 
        if (tutorial === null)
            return res.status(404).json({
                success: false, msg: `Cannot find any tutorial with ID ${req.params.idT}.`
            });
        // answer with a success status if tutorial was found
        return res.json({ success: true, tutorial: tutorial });
    }
    catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({
                success: false, msg: "ID parameter is not a valid ObjectId (it must be must be a single String of 12 bytes or a string of 24 hex characters)"
            });
        }
        return res.status(500).json({
            success: false, msg: `Error retrieving tutorial with ID ${req.params.idT}.`
        });
    }
};

// Create and Save a new Tutorial
exports.create = async (req, res) => {
    try {
        // Save Tutorial in the database
        const tutorial = new Tutorial({
            title: req.body.title,
            description: req.body.description,
            published: req.body.published
        });

        let newTutorial = await tutorial.save();
        res.status(201).json({
            success: true,
            msg: "New tutorial created.", URL: "/tutorials/" + newTutorial._id
        });
    }
    catch (err) {
        console.log(err instanceof SyntaxError)
        if (err.name === "ValidationError") {
            let errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });
            return res.status(400).json({ success: false, msg: errors });
        }
        return res.status(500).json({
            success: false, msg: err.message || "Some error occurred while creating the tutorial."
        });
    }
};

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
    try {
        console.log("Update")
        let tutorial = await Tutorial.findById(req.params.idT);console.log(tutorial)
        tutorial.published = req.body.published
        tutorial.save()
        return res.status(200).json({
            success: true, msg: `Tutorial was updated successfully.`
        });
    } catch (err) {

        return res.status(500).json({
            message: `Error updating Tutorial with id=${req.params.idT}.`
        });
    };
};

// Delete a Tutorial with the specified id in the request
exports.delete = async (req, res) => {
    try {
        console.log("Delete")
        let tutorial = await Tutorial.findById(req.params.idT);console.log(tutorial)
        return res.status(200).json({
            success: true, msg: `Tutorial was deleted successfully.`
        });
    } catch (err) {
        return res.status(500).json({
            success: false, msg: `Error deleting Tutorial with id=${req.params.idT}.`
        });
    };
};

