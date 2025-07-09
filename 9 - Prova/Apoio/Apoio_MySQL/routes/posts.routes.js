// routes for /posts requests
const express = require('express');
const router = express.Router();

// include controller functions
const postsController = require('../controllers/posts.controller.js');

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);

router.post('/',  postsController.addPost);
router.put('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

// NEW ROUTES FOR TAGS IN POSTS
router.put('/:id/tags/:tag', postsController.addTagToPost); // add a tag to a post
router.delete('/:id/tags/:tag', postsController.deleteTagFromPost); // delete a tag from a post

module.exports = router;    