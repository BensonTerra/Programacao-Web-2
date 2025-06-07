const express = require('express');
const authController = require("../controllers/auth.controller");
const eventsController = require("../controllers/events.controller");
const bookingsController = require("../controllers/booking.controller");

// express router
let router = express.Router();

router.route('/')
    .get(eventsController.findAll)
    .post(authController.verifyToken, authController.isAdminFacilitador, bookingsController.create)

router.route('/myEvents')
    .get(authController.verifyToken, authController.isAdminFacilitador, eventsController.findAllMyEvents);

/*
router.route('/:idEvent')
    .get(bookingsController.findOne)
    .patch(authController.verifyToken, authController.isAdminFacilitador, bookingsController.update)
    .delete(authController.verifyToken, authController.isAdminFacilitador, bookingsController.delete);
*/

router.route('/:idEvent/reserva')
    .post(authController.verifyToken, bookingsController.create);

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;