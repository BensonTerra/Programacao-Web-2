// import movies data
let arrays = require("../models/teste1.model");
let arrayProducts = arrays.products;//console.log(products)
let purchases = arrays.purchases;//console.log(purchases)
let array
// exports custom request payload validation middleware

exports.bodyValidator = (req, res, next) => {;
  if(req.url=='/products'){
    console.log("check")
    array=arrayProducts
    if(!checkArrayProducts(req, array) && req.method=='POST') {
      next()
    }
    else {
      res.json("já adicionado")
    }
  }
};

exports.findAll = (req, res) => {
  console.log("findAll");

  res.json({
    products: arrayProducts,    // <-- seu array de produtos
    purchases: purchases   // <-- seu array de compras
  });
};


exports.findAllProducts = (req, res) => {
  res.json(arrayProducts);
};

exports.findOneProduct = async (req, res) => {
  // obtains only a single entry from the table, using the provided primary key
  let product = arrayProducts.find( product => product.id == req.params.idP); console.log(product);

  // if tutorial was not found
  if (product === null)
    // return next(CreateError(404, `Cannot find any tutorial with ID ${req.params.idT}.`));
    throw new ErrorHandler(404, `Cannot find any product with ID ${req.params.idP}.`);

  // answer with a success status if tutorial was found
  return res.json({ 
    success: true, 
    data: product
    });
  }

exports.create = (req, res) => {
  checkBodyProducts(req)
  
  //console.log(array)
  //console.log("Proximo Id: " + checkLastId(array));
  req.body.id = checkLastId(array);
  //res.json(req.body)
  array.push(req.body);
  res.json(arrayProducts);
  
  //res.json("ok")
}



exports.findAllPurchases = (req, res) => {
  res.json(purchases);
};

function checkBodyProducts(req) {
  console.log("checkBody");
  return (req.body.name && req.body.price && req.body.stock && req.body.type)
} 

function checkArrayProducts(req,arrays) {
  console.log("checkArray");
  return (arrays.some(array =>
    array.name === req.body.name &&
    array.price === req.body.price &&
    array.stock === req.body.stock &&
    array.type === req.body.type
  ))
}

function checkLastId(array) {
  console.log("checkLastId")
  return ((array[array.length-1].id)+1)
}