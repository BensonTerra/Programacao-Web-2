const express = require('express');
const authController = require("../controllers/auth.controller");
const usersController = require("../controllers/users.controller");
const accommodationsController = require("../controllers/accommodations.controller");

const router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         ÁREA PRIVADA (Administrador)                                         */
/*--------------------------------------------------------------------------------------------------------------*/
router.route('/')
  .get(authController.verifyToken, authController.isAdmin, usersController.findAllUsers)
  .post(usersController.create);

router.route('/:idUser')
  .get(authController.verifyToken, authController.isAdmin, usersController.findOneUser)
  .patch(authController.verifyToken, authController.isAdmin, usersController.updateOneUser)
  .delete(authController.verifyToken, authController.isAdmin, usersController.deleteOneUser);

/*--------------------------------------------------------------------------------------------------------------*/
/*                              ÁREA PRIVADA (Administrador / Facilitador)                                      */
/*--------------------------------------------------------------------------------------------------------------*/
router.route('/me/accommodationBookings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findAllMyAccommodationBookings);

router.route('/me/accommodationBookings/:idAccommodationBooking')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findOneMyAccommodationBooking)
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, usersController.updateOneMyAccommodationBooking)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, usersController.deleteOneMyAccommodationBooking);

router.route('/me/eventBookings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findAllMyEventBookings);

router.route('/me/eventBookings/:idEventBooking')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findOneMyEventBooking)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, usersController.deleteOneMyEventBooking);

router.route('/me/accommodationRatings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.findAllAccommodationRatings);

router.route('/me/accommodationRatings/:idAccommodationRating')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.findOneAccommodationRating)
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.updateOneAccommodationRating)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, accommodationsController.deleteOneAccommodationRating);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         ÁREA PÚBLICA DO UTILIZADOR                                           */
/*--------------------------------------------------------------------------------------------------------------*/

router.route('/')
  .post(usersController.create);

router.route('/login')
  .post(usersController.login);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                          ROTA PARA ERROS GENÉRICOS                                           */
/*--------------------------------------------------------------------------------------------------------------*/

router.all('*', (req, res) => {
  res.status(400).json({
    success: false,
    message: `The API does not recognize the request on ${req.method} ${req.url}`
  });
});

module.exports = router;
