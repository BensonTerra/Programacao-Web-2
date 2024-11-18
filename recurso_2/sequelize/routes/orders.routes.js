const express = require('express');
const orderController = require("../controllers/orders.controller");

// express router
let router = express.Router();

router.route('/orders')
    .get(orderController.findAll)
    .post(orderController.create);

router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;