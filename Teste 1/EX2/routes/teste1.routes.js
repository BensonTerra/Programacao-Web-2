const express = require('express');
const router = express.Router();
// import controller middleware
const teste1Controller = require("../controllers/teste1.controller");

// Rota ('/'))
router.route('/')
.get(teste1Controller.findAllProducts)



// Rota ('/:products')
router.route('/products')
.post(teste1Controller.bodyValidator,teste1Controller.create)


router.all('*', (req, res) => {
res.status(404).json({ message: 'MOVIES: what???' }); //send a predefined error message
})
//export this router
module.exports = router;