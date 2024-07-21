const express = require('express');
const booksController = require("../controllers/books.controller");

// express router
let router = express.Router();

router.route('/')
    .get(booksController.findAll)
    .post(booksController.create);

router.route('/:id')
    .get(booksController.findOne)
    //.put(bookController.update)
    //.delete(bookController.delete);

// you can nest routers by attaching them as middleware​
//router.use('/:idT/comments', require("./comments.routes"));


router.all('*', function (req, res) {
    //send an predefined error message 
    res.status(400).json({ success: false, message:`The API does not recognize the request on ${req.method} ${req.url}` });
})

module.exports = router;