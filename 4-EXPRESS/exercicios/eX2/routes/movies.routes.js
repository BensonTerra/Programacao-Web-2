const express = require('express');
const router = express.Router();
// import controller middleware
const moviesController = require("../controllers/movies.controller");

// Rota ('/'))
router.route('/')
.get(moviesController.findAll)
.get(moviesController.findOneWithQuery)
.post(moviesController.bodyValidator, moviesController.create)
.delete(moviesController.deleteOneWithQuery)



// Rota ('/:id')
router.route('/:id')
.get(moviesController.findOne)
.put(moviesController.bodyValidator, moviesController.update)
.delete(moviesController.delete);

router.all('*', (req, res) => {
res.status(404).json({ message: 'MOVIES: what???' }); //send a predefined error message
})
//export this router
module.exports = router;