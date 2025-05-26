const express = require('express');
const eventController = require("../controllers/events.controller");

// express router
let router = express.Router();

router.route('/')
    .get(eventController.findAll)
//    .post(accommodationController.create)

router.route('/:idEvent')
    .get(eventController.findOne)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;