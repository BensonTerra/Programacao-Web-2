const db = require("../models/index.js");
const Comment = db.comments;
const Tutorial = db.tutorials;

exports.findAll = async (req, res) => {
    console.clear();
    console.log("Comments---findAll");

    try {
        // Substitua 'Tutorial' pelo nome correto do seu modelo
        let data = await Tutorial
            .find({ _id: req.params.idT }) // Corrigido: Usar apenas uma chave para o objeto de filtro
            .select('comments') // Selecionar apenas o campo 'comments' (isso incluirá também o campo _id por padrão)
            .exec();

        // Retornar a resposta de sucesso com os dados encontrados
        return res.status(200).json({ success: true, tutorials: data });
    } catch (err) {
        // Retornar uma resposta de erro em caso de exceção
        return res.status(500).json({
            success: false,
            msg: err.message || "Some error occurred while retrieving the tutorials."
        });
    }
};

// Create and Save a new Comment
exports.create = async (req, res) => {
    try {
        const comment = new Comment({
            text: req.body.text
        });
        let data = await comment.save();

        const tutorial = await Tutorial.findByIdAndUpdate(
            req.params.idT,
            { $push: { comments: [data._id] } }
        ).exec();
        // no data returned means there is no tutorial in DB with that given ID 
        if (tutorial === null) {
            await Comment.findByIdAndRemove(data._id).exec();// remove the previously created comment
            return res.status(404).json({
                success: false, msg: `Cannot find any tutorial with ID ${req.params.idT}.`
            });
        }

        res.status(201).json({ success: true, msg: "New Comment created.", URL: "/tutorials/" + req.params.idT + "/comments/" + data._id });
    }
    catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({
                success: false, msg: "ID parameter is not a valid ObjectId (it must be must be a single String of 12 bytes or a string of 24 hex characters)"
            });
        }
        res.status(500).json({
            success: false, msg: `Some error occurred while creating the Comment.`
        });
    }
};


// Delete a Comment with the specified id in the request
exports.delete = async (req, res) => {
    console.log("Comments---Delete");
    try {
        
        const tutorial = await Tutorial.findById(req.params.idT); console.log(tutorial)
        if(!tutorial) {
            
        }


        return res.status(200).json({
            success: true, msg: `Comment id=${req.params.idC} was deleted successfully.`
        });

    } catch (err) {
        res.status(500).json({
            message: `Error deleting Comment with id=${req.params.commentID}.`
        });
    };
};
