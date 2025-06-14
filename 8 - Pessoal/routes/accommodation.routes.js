const express = require('express');
const authController = require("../controllers/auth.controller");
const accommodationsController = require("../controllers/accommodations.controller");
const bookingsController = require("../controllers/booking.controller");

const router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                              ÁREA PRIVADA (Administrador / Facilitador)                                      */
/*--------------------------------------------------------------------------------------------------------------*/

router.route('/myAccommodations')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.findAllMyAccommodations)
  .post(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.createOneMyAccommodation);

router.route('/myAccommodations/:idAccommodation')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.findOneAccommodation)
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.updateOneMyAccommodation)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.deleteOneMyAccommodation);

router.route('/myAccommodations/:idAccommodation/bookings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.findAllAccommodationBookings);

router.route('/myAccommodations/:idAccommodation/bookings/:idAccommodationBooking')
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.validateAccommodationBooking);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                   ÁREA PÚBLICA DO UTILIZADOR                                                 */
/*--------------------------------------------------------------------------------------------------------------*/

// Listar todas as acomodações públicas
router.route('/')
  .get(accommodationsController.findAllAccommodations);

// Detalhes de uma acomodação pública por ID
router.route('/:idAccommodation')
  .get(accommodationsController.findOneAccommodation);

// Criar reserva pública para uma acomodação (requer login e permissão)
router.route('/:idAccommodation/booking')
  .post(authController.verifyToken, bookingsController.createOneBooking);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         TRATAMENTO DE ROTA INVÁLIDA                                          */
/*--------------------------------------------------------------------------------------------------------------*/

// Qualquer outra rota não reconhecida
router.all('*', (req, res) => {
  res.status(400).json({
    success: false,
    message: `The API does not recognize the request on ${req.method} ${req.url}`,
  });
});

module.exports = router;
