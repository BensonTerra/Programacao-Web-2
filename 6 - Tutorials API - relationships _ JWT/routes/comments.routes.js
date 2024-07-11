const express = require('express');
const authController = require("../controllers/auth.controller");
const commentController = require("../controllers/comments.controller");

// set 'mergeParams: true' on the router to access params from the parent router (like idT req parameter)​
let router = express.Router({ mergeParams: true });

// all routs require to find a tutorial given its ID
router.use(commentController.findTutorial)

router.route('/')
    .get(commentController.findAllComments) // GET /tutorials/:idT/comments
    .post(authController.verifyToken, commentController.create);//POST /tutorials/:idT/comments

router.route('/:idC')
    .get(commentController.findOneComment) // GET /tutorials/:idT/comments/:idC
    .patch(authController.verifyToken, commentController.isAuthor, commentController.update) // PATCH /tutorials/:idT/comments/:idC
    .delete(authController.verifyToken, commentController.isAuthor, commentController.delete);// DELETE /tutorials/:idT/comments/:idC


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message: `The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;