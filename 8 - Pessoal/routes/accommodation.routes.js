const express = require('express');
const authController = require("../controllers/auth.controller");
const accommodationController = require("../controllers/accommodations.controller");
const bookingsController = require("../controllers/booking.controller");  // controlador das reservas

// express router
let router = express.Router();

router.route('/')
    .get(accommodationController.findAll)
    .get(authController.verifyToken, authController.isAdminFacilitador, accommodationController.findAllMyAccommodations) // get all accommodations for facilitators
    .post(authController.verifyToken, authController.isAdminFacilitador, accommodationController.create)

router.route('/:idAccommodation')
    .get(accommodationController.findOne)

router.route('/:idAccommodation/reserva')
    .post(authController.verifyToken, bookingsController.create);

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;