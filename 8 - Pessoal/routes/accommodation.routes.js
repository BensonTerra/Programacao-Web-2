const express = require('express');
const authController = require("../controllers/auth.controller");
const accommodationsController = require("../controllers/accommodations.controller");
const bookingsController = require("../controllers/booking.controller");

const router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                              ÁREA PRIVADA (Administrador / Facilitador)                                      */
/*--------------------------------------------------------------------------------------------------------------*/

// Listar ou criar minhas acomodações
router.route('/myAccommodations')
  .get(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.findAllMyAccommodations)
  .post(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.create);

// Ver, atualizar ou deletar uma das minhas acomodações
router.route('/myAccommodations/:idAccommodation')
  .get(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.findOneAccommodation)
  .patch(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.update)
  .delete(authController.verifyToken, authController.isAdminFacilitador, accommodationsController.delete);

// Ver todas as reservas de uma acomodação minha
router.route('/myAccommodations/:idAccommodation/bookings')
  .get(authController.verifyToken, authController.isAdminFacilitador, bookingsController.findAll);

// Validar uma reserva específica de uma acomodação minha
router.route('/myAccommodations/:idAccommodation/bookings/:idAccommodationBooking')
  .get(authController.verifyToken, authController.isAdminFacilitador, bookingsController.validateAccommodationBooking);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                   ÁREA PÚBLICA DO UTILIZADOR (sem login)                                     */
/*--------------------------------------------------------------------------------------------------------------*/

// Listar todas as acomodações públicas
router.route('/')
  .get(accommodationsController.findAllAccommodations);

// Detalhes de uma acomodação pública por ID
router.route('/:idAccommodation')
  .get(accommodationsController.findOneAccommodation);

// Criar reserva pública para uma acomodação (requer login e permissão)
router.route('/:idAccommodation/booking')
  .post(authController.verifyToken, authController.isAdminFacilitador, bookingsController.create);

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
