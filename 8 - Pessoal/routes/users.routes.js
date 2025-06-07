const express = require('express');
const authController = require("../controllers/auth.controller");
const usersController = require("../controllers/users.controller");

// express router
let router = express.Router();

router.route('/')
    .get(authController.verifyToken, authController.isAdminFacilitador, usersController.findAll)
    .post(usersController.create)

router.route('/:idUser')
    .get(usersController.findOne)

router.route('/login')
    .post(usersController.login)


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;