const express = require('express');
const authController = require("../controllers/auth.controller");
const accommodationsController = require("../controllers/accommodations.controller");
const bookingsController = require("../controllers/booking.controller");

const router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         ÁREA PRIVADA (Administrador)                                         */
/*--------------------------------------------------------------------------------------------------------------*/

router.route('/:idAccommodation')
  .delete(authController.verifyToken, authController.isAdmin, accommodationsController.deleteOneMyAccommodation)

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
  .get(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.findAllAccommodationBookings)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.deleteOneMyAccommodationBooking);

router.route('/myAccommodations/:idAccommodation/bookings/:idAccommodationBooking')
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, bookingsController.validateAccommodationBooking);
    
router.route('/myAccommodations/:idAccommodation/ratings')
  .get(authController.verifyToken,authController.isAdminOrFacilitador, accommodationsController.findAllAccommodationRatings) 

/*--------------------------------------------------------------------------------------------------------------*/
/*                                   ÁREA PÚBLICA DO UTILIZADOR                                                 */
/*--------------------------------------------------------------------------------------------------------------*/
router.route('/')
  .get(accommodationsController.findAllAccommodations);

router.route('/:idAccommodation')
  .get(accommodationsController.findOneAccommodation);

router.route('/:idAccommodation/booking')
  .post(authController.verifyToken, bookingsController.createOneBooking);
  
router.route('/:idAccommodation/ratings')
  .get(authController.verifyToken, accommodationsController.findAllAccommodationRatings) 
  .post(authController.verifyToken, accommodationsController.createOneAccommodationRating)
  .patch(authController.verifyToken, accommodationsController.updateOneAccommodationRating)
  .delete(authController.verifyToken, accommodationsController.deleteOneAccommodationRating);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         TRATAMENTO DE ROTA INVÁLIDA                                          */
/*--------------------------------------------------------------------------------------------------------------*/

router.all('*', (req, res) => {
  res.status(400).json({
    success: false,
    message: `The API does not recognize the request on ${req.method} ${req.url}`,
  });
});

module.exports = router;
