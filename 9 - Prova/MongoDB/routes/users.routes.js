// route for /tags requests

const express = require('express');
const router = express.Router();

// include controller functions
const usersController = require('../controllers/users.controller.js');

router.get('/', usersController.getAllUsers);
router.get('/:id/posts', usersController.getPostsFromUser); // get all posts from a user

module.exports = router;