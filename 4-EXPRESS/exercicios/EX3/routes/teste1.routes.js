const express = require('express');
const router = express.Router();
// import controller middleware
const teste1Controller = require("../controllers/teste1.controller");

// Rota ('/'))
router.route('/')
.get(teste1Controller.findAll)

// Rota ('/:products')
router.route('/products')
.get(teste1Controller.findAllProducts)
.post(teste1Controller.bodyValidator,teste1Controller.create)

// Rota ('/purchases')
router.route('/purchases')
.get(teste1Controller.findAllPurchases)

router.route('/purchases/:idP')
.get(teste1Controller.findOneProduct)


router.all(/.*/), (req, res) => {
res.status(404).json({ message: 'Erro de rota' }); //send a predefined error message
})
//export this router
module.exports = router;