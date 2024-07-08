const express = require('express');
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

// express router
let router = express.Router();


router.route('/')
    //authController.verifyToken, authController.isAdmin, 
    .get(authController.verifyToken, authController.isAdmin, userController.getAllUsers) //ADMIN ACCESS ONLY
    .post(userController.create);   //PUBLIC

router.route('/login')
    .post(userController.login);    //PUBLIC

router.route('/:userID')
    .get(authController.verifyToken, authController.isAdminOrLoggedUser, userController.getUser); //ADMIN or LOGGED USER ONLY


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message: `The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;