const express = require('express');

const tagController = require("../controllers/tags.controller");

// express router
let router = express.Router();

router.route('/')
    .get(tagController.findAll) // GET /tags
    .post(tagController.create); // POST /tags



router.all(/.*/, function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message: `The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;