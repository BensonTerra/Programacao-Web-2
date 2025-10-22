const express = require('express');
const router = express.Router();

// include AUTH controller functions
const authController = require('../controllers/auth.controller.js');
const projectController = require('../controllers/project.controller.js')
const submissionController = require('../controllers/submission.controller.js')

router.route('/')
    .get(projectController.getAll); //PUBLIC   
    
router.route('/:id')
    .get(authController.verifyToken, submissionController.getAll) //PUBLIC   
    .post(authController.verifyToken, submissionController.postSubmission)  

module.exports = router;