const express = require('express');
const authController = require("../controllers/auth.controller");
const accommodationsController = require("../controllers/accommodations.controller");
const bookingsController = require("../controllers/booking.controller");  // controlador das reservas
//const accommodationBooking = require('../models');

// express router
let router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         Area pública do utilizador                                           */
/*--------------------------------------------------------------------------------------------------------------*/
router.route('/')
    .get(accommodationsController.findAll)

router.route('/:idAccommodation')
    .get(accommodationsController.findOne)

router.route('/:idAccommodation/booking')
    .post(authController.verifyToken, authController.isAdminFacilitador, bookingsController.create);
/*--------------------------------------------------------------------------------------------------------------*/
/*                                         Area privada do admistrador e facilitador                            */
/*--------------------------------------------------------------------------------------------------------------*/
router.route('/myAccommodations')
    .get(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.findAllMyAccommodations)
    .post(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.create)

router.route('/myAccommodations/:idAccommodation')
    .get(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.findOne)
    .patch(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.update)
    .delete(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.delete);

router.route('/myAccommodations/:idAccommodation/bookings')
    .get(authController.verifyToken, authController.isAdminFacilitador, bookingsController.findAll)
    //valido uma reserva de alojamento

router.route('/myAccommodations/:idAccommodation/bookings/:idAccommodationBooking')
    .get(authController.verifyToken, authController.isAdminFacilitador, bookingsController.validateAccommodationBooking)

    //valido uma reserva de alojamento


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;