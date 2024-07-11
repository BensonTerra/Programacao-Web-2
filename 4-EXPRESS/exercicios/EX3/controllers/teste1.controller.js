// import movies data
let arrays = require("../models/teste1.model");
let products = arrays.products;//console.log(products)
let purchases = arrays.purchases;//console.log(purchases)
let array
// exports custom request payload validation middleware

exports.findAllProducts = (req, res) => {
  res.json(products);
};

exports.bodyValidator = (req, res, next) => {;
  if(req.url=='/products'){
    console.log("check")
    array=products
    if(!checkArrayProducts(req, array) && req.method=='POST') {
      next()
    }
    else {
      res.json("já adicionado")
    }
  }
};

exports.create = (req, res) => {
  checkBodyProducts(req)
  
  //console.log(array)
  //console.log("Proximo Id: " + checkLastId(array));
  req.body.id = checkLastId(array);
  //res.json(req.body)
  array.push(req.body);
  res.json(products);
  
  //res.json("ok")
}

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