const express = require('express');
const router = express.Router();

// include controller functions
const postsController = require('../controllers/posts.controller.js');

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);

router.post('/',  postsController.addPost);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

module.exports = router;    