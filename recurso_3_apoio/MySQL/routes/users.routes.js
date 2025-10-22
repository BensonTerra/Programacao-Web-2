const express = require('express');
const router = express.Router();

// include AUTH controller functions
const authController = require('../controllers/auth.controller.js');
const userController = require('../controllers/user.controller')

router.route('/')
    .get(userController.getAll); //PUBLIC

router.route('/login')
    .post(authController.login); //PUBLIC
    

module.exports = router;