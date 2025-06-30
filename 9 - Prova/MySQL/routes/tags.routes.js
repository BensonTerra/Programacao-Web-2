// route for /tags requests
const express = require('express');
const router = express.Router();

// include controller functions
const tagsController = require('../controllers/tags.controller.js');

router.get('/', tagsController.getAllTags);
router.post('/',  tagsController.addTag);

module.exports = router;