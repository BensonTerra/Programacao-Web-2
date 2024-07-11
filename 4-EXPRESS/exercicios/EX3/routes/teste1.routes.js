const express = require('express');
const router = express.Router();
// import controller middleware
const teste1Controller = require("../controllers/teste1.controller");

// Rota ('/'))
router.route('/')




// Rota ('/:products')
router.route('/products')
.get(teste1Controller.findAllProducts)
.post(teste1Controller.bodyValidator,teste1Controller.create)


router.all('*', (req, res) => {
res.status(404).json({ message: 'Error' }); //send a predefined error message
})
//export this router
module.exports = router;