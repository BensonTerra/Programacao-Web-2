const express = require('express');
const authController = require("../controllers/auth.controller");
const usersController = require("../controllers/users.controller");

const router = express.Router();

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         ÁREA PRIVADA (Administrador)                                         */
/*--------------------------------------------------------------------------------------------------------------*/

// Operações administrativas sobre usuários
router.route('/')
  .get(authController.verifyToken, authController.isAdmin, usersController.findAllUsers)
  .post(usersController.create);

router.route('/:idUser')
  .get(authController.verifyToken, authController.isAdmin, usersController.findOneUser)
  .patch(authController.verifyToken, authController.isAdmin, usersController.updateOneUser) //modifcar cargo
  .delete(authController.verifyToken, authController.isAdmin, usersController.deleteOneUser);

/*--------------------------------------------------------------------------------------------------------------*/
/*                              ÁREA PRIVADA (Administrador / Facilitador)                                      */
/*--------------------------------------------------------------------------------------------------------------*/

// Listar todas as reservas de acomodações do próprio usuário (com permissão)
router.route('/me/accommodationBookings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findAllMyAccommodationBookings);

router.route('/me/accommodationBookings/:idAccommodationBooking')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findOneMyAccommodationBooking)
  .patch(authController.verifyToken, authController.isAdminOrFacilitador, usersController.updateOneMyAccommodationBooking)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, usersController.deleteOneMyAccommodationBooking);

// Listar todas as reservas de eventos do próprio usuário (com permissão)
router.route('/me/eventBookings')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findAllMyEventBookings);

router.route('/me/eventBookings/:idEventBooking')
  .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findOneMyEventBooking)
  .delete(authController.verifyToken, authController.isAdminOrFacilitador, usersController.deleteOneMyEventBooking);

/*--------------------------------------------------------------------------------------------------------------*/
/*                                         ÁREA PÚBLICA DO UTILIZADOR                                           */
/*--------------------------------------------------------------------------------------------------------------*/

// Login do usuário
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
