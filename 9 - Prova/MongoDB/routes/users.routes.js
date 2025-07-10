const express = require('express');
const usersController = require("../controllers/users.controller");

const router = express.Router();

router.route('/')
  .get(usersController.getAllUsers)

module.exports = router;