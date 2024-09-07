const express = require('express');
const bookGenreController = require("../../controllers/recursoControllers/bookGenre.controller")

//express router
let router = express.Router();

router.route('/')
    .get(bookGenreController.findAll)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;