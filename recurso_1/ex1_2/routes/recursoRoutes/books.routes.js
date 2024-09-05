const express = require('express');
const bookController = require("../../controllers/recursoControllers/book.controller")

//express router
let router = express.Router();

router.route('/')
    .get(bookController.findAll)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;