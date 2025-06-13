const express = require('express');
const authController = require("../controllers/auth.controller");
const usersController = require("../controllers/users.controller");

// express router
let router = express.Router();



router.route('/')
    .get(authController.verifyToken, authController.isAdmin, usersController.findAllUsers)
    .post(usersController.create)

router.route('/:idUser')
    .get(authController.verifyToken, authController.isAdmin, usersController.findOneUser)
    .patch(authController.verifyToken, authController.isAdmin, usersController.updateOneUser)
    .delete(authController.verifyToken, authController.isAdmin, usersController.deleteOneUser)


router.route('/login')
    .post(usersController.login)

    
router.route('/me/accommodationBookings') 
    .get(authController.verifyToken,  authController.isAdminOrFacilitador, usersController.findAllMyAccommodationBookings);

router.route('/me/accommodationBookings/:idAccommodationBooking')
    .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findOneMyAccommodationBooking)
    .patch(authController.verifyToken, authController.isAdminOrFacilitador, usersController.updateOneMyAccommodationBooking)
    .delete(authController.verifyToken, authController.isAdminOrFacilitador, usersController.deleteOneMyAccommodationBooking)

router.route('/me/eventBookings') 
    .get(authController.verifyToken,  authController.isAdminOrFacilitador, usersController.findAllMyEventBookings);

router.route('/me/eventBookings/:idEventBooking')
    .get(authController.verifyToken, authController.isAdminOrFacilitador, usersController.findOneMyEventBooking)
    .delete(authController.verifyToken, authController.isAdminOrFacilitador, usersController.deleteOneMyEventBooking)


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;