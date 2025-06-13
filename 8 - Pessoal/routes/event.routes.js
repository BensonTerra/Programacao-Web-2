const express = require('express');
const authController = require("../controllers/auth.controller");
const eventsController = require("../controllers/events.controller");
const bookingsController = require("../controllers/booking.controller");

// express router
let router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                              ÁREA PRIVADA (Administrador / Facilitador)                                      */
/*--------------------------------------------------------------------------------------------------------------*/

router.route('/myEvents')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.findAllMyEvents)
  .post(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.create);

router.route('myEvents/:idEvent')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.findOneEvent)
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.update)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, eventsController.delete);

router.route('/myEvents/:idEvent/bookings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.findAll);
  //PATCH
  //DELETE

/*--------------------------------------------------------------------------------------------------------------*/
/*                                   ÁREA PÚBLICA DO UTILIZADOR                                                 */
/*--------------------------------------------------------------------------------------------------------------*/

// Listar todas as acomodações públicas
router.route('/')
  .get(eventsController.findAllEvents);

// Detalhes de uma acomodação pública por ID
router.route('/:idEvent')
  .get(eventsController.findOneEvent);

// Criar reserva pública para uma acomodação (requer login e permissão)
router.route('/:idEvent/booking')
  .post(authController.verifyToken, bookingsController.create);


/*
router.route('/:idEvent/booking')
    .post(authController.verifyToken, authController.isAdminFacilitador, bookingsController.create)
    .patch(authController.verifyToken, authController.isAdminFacilitador, eventsController.update)
    .delete(authController.verifyToken, authController.isAdminFacilitador, eventsController.delete);
*/

router.route('/')
    .get(eventsController.findAllEvents)

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;