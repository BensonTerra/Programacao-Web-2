const express = require('express');
const authController = require("../controllers/auth.controller");
const eventsController = require("../controllers/events.controller");
const bookingsController = require("../controllers/booking.controller");

const router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         ÁREA PRIVADA (Administrador)                                         */
/*--------------------------------------------------------------------------------------------------------------*/

router.route('/:idEvent')
  .delete(authController.verifyToken, authController.isAdmin, eventsController.deleteOneMyEvent)

/*--------------------------------------------------------------------------------------------------------------*/
/*                              ÁREA PRIVADA (Administrador / Facilitador)                                      */
/*--------------------------------------------------------------------------------------------------------------*/

router.route('/myEvents')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.findAllMyEvents)
  .post(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.createOneMyEvent);

router.route('/myEvents/:idEvent')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.findOneEvent)
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.updateOneMyEvent)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.deleteOneMyEvent);

router.route('/myEvents/:idEvent/bookings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.findAllEventBookings)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.deleteOneMyEventBooking);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                   ÁREA PÚBLICA DO UTILIZADOR                                                 */
/*--------------------------------------------------------------------------------------------------------------*/
router.route('/')
  .get(eventsController.findAllEvents);

router.route('/:idEvent')
  .get(eventsController.findOneEvent);

router.route('/:idEvent/booking')
  .post(authController.verifyToken, bookingsController.createOneBooking)
  .delete(authController.verifyToken, bookingsController.deleteOneMyEventBooking);


/*
router.route('/:idEvent/booking')
    .post(authController.verifyToken, authController.isAdminFacilitador, bookingsController.create)
    .patch(authController.verifyToken, authController.isAdminFacilitador, eventsController.update)
    .delete(authController.verifyToken, authController.isAdminFacilitador, eventsController.delete);
*/

router.all('*', function (req, res) {
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;