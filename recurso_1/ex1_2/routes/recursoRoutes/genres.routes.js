const express = require('express');
const genreController = require("../../controllers/recursoControllers/genre.controller")

//express router
let router = express.Router();

router.route('/')
    .get(genreController.findAll)

router.all(/.*/, function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;