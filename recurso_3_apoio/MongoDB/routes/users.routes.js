const express = require('express');
const router = express.Router();

// include AUTH controller functions
const authController = require('../controllers/auth.controller.js');


router.route('/login')
    .post(authController.login); //PUBLIC
    

module.exports = router;