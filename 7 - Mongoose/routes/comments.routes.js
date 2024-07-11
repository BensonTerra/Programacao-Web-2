const express = require('express');
const commentController = require("../controllers/comments.controller");

// set 'mergeParams: true' on the router to access params from the parent router (like idT req parameter)​
let router = express.Router({mergeParams: true});

router.route('/')
    .get( commentController.findAll)
    .post( commentController.create); //POST /tutorials/:idT/comments
    
router.route('/:idC')
    .delete( commentController.delete); // DELETE /tutorials/:idT/comments/:idC

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(404).json({ message: 'COMMENTS: what???' });
})

module.exports = router;