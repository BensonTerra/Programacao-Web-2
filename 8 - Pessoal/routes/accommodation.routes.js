const express = require('express');
const accommodationController = require("../controllers/accommodations.controller");

// express router
let router = express.Router();

router.route('/')
    .get(accommodationController.findAll)
//    .post(accommodationController.create)

router.route('/:idAccommodation')
    .get(accommodationController.findOne)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;