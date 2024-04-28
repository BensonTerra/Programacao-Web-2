let arrays = require("../models/teste1.model");
let products = arrays.products;
let array;

exports.findAllProducts = (req, res) => {
  res.json(products);
};

exports.bodyValidator = (req, res, next) => {
  if (req.url === '/products') {
    console.log("/----------------------------------/");
    console.log("check");
    array = products;
    if (!checkArrayProducts(req, array) && req.method === 'POST') {
      next();//to create
    } else {
      res.json("já adicionado");
    }
  }
};

exports.create = (req, res) => {
  console.log("/----------------------------------/");
  console.log("create");
  console.log(checkBodyProducts(req));
  
  if (!checkBodyProducts(req)) {
    return res.status(400).json("Dados incompletos");
  }

  // Se os dados estiverem completos, continue com o processo de criação
  req.body.id = checkLastId(array);
  array.push(req.body);
  res.json(products);
};


let types = ["drink", "snack"];

function checkBodyProducts(req) {
  console.log("/----------------------------------/");
  console.log("checkBody");
  let body = req.body;
  if (body.name !== "" && body.price !== 0.0 && body.stock !== 0 && types.includes(body.type)) {
    return true;
  } else {
    //console.log("Dados incompletos");
    return false;
  }
}

function checkArrayProducts(req, arrays) {
  console.log("/----------------------------------/");
  console.log("checkArray");
  return arrays.some(array =>
    array.name === req.body.name &&
    array.price === req.body.price &&
    array.stock === req.body.stock &&
    array.type === req.body.type
  );
}

function checkLastId(array) {
  console.log("checkLastId");
  return array[array.length - 1].id + 1;
};