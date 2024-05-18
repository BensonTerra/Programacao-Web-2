const express = require('express');
const tutorialController = require("../controllers/tutorials.controller");

// express router
let router = express.Router();

router.route('/')
    .get(tutorialController.findAll)
    .post(tutorialController.create);

router.route('/:idT')
    .get(tutorialController.findOne)
    .put(tutorialController.update)
    .delete(tutorialController.delete);

// you can nest routers by attaching them as middleware​
router.use('/:idT/comments', require("./comments.routes"));

// add or delete tag from a tutorial
router.route('/:idT/tags/:idTag')
    .put(tutorialController.addTag) // PUT /tutorials/:idT/tags/:idTag
    .delete(tutorialController.deleteTag); // DELETE /tutorials/:idT/tags/:idTag


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;