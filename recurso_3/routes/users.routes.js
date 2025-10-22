const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.route('/')
  .get(usersController.getAllUsers);

router.route('/:id')
  .get(usersController.getOneUser)
  .put(usersController.updateOneUser)
  .delete(usersController.deleteOneUser);

router.route('/:id/posts')
  .get(usersController.getPostsFromUser);

module.exports = router;
