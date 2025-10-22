const express = require('express');
const instanceController = require("../../controllers/recursoControllers/instance.controller")

//express router
let router = express.Router();

router.route('/')
    .get(instanceController.findAll)
    .post(instanceController.create)

router.all(/.*/, function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;