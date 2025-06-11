const express = require('express');
const authController = require("../controllers/auth.controller");
const eventsController = require("../controllers/events.controller");
const bookingsController = require("../controllers/booking.controller");

// express router
let router = express.Router();

router.route('/')
    .get(eventsController.findAll)
    .post(authController.verifyToken, authController.isAdminFacilitador, eventsController.create);

router.route('/myEvents')
    .get(authController.verifyToken, authController.isAdminFacilitador, eventsController.findAllMyEvents);


router.route('/:idEvent')
    .get(authController.verifyToken, authController.isAdminFacilitador, eventsController.findOne)
    .patch(authController.verifyToken, authController.isAdminFacilitador, eventsController.update)
    .delete(authController.verifyToken, authController.isAdminFacilitador, eventsController.delete);


router.route('/:idEvent/booking')
    .post(authController.verifyToken, authController.isAdminFacilitador, bookingsController.create)
    .patch(authController.verifyToken, authController.isAdminFacilitador, eventsController.update)
    .delete(authController.verifyToken, authController.isAdminFacilitador, eventsController.delete);

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;