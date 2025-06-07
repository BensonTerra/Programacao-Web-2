const express = require('express');
const authController = require("../controllers/auth.controller");
const accommodationsController = require("../controllers/accommodations.controller");
const bookingsController = require("../controllers/booking.controller");  // controlador das reservas

// express router
let router = express.Router();

router.route('/')
    .get(accommodationsController.findAll)
    .post(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.create)

router.route('/myAccommodations')
    .get(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.findAllMyAccommodations)

router.route('/:idAccommodation')
    .get(accommodationsController.findOne)
    .patch(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.update)
    .delete(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.delete);

router.route('/:idAccommodation/reserva')
    .post(authController.verifyToken, bookingsController.create);

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;