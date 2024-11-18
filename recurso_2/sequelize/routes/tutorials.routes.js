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

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;