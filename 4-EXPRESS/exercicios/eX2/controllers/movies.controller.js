// import movies data
let movies = require("../models/movies.model");
// exports custom request payload validation middleware

// Display list of all movies
exports.findAll = (req, res) => {
  res.json(movies);
};

// Display only 1 movies
exports.findOne = (req, res) => {
  res.json(movies.filter(movie => movie.id == req.params.id)[0])
};

// exports custom request payload validation middleware
exports.bodyValidator = (req, res, next) => {
  if(!checkArray(req) && req.method=='POST') {
    console.log("GET")
    next();
  }
  else if(!checkArray(req) && req.method=='PUT') {
    console.log("PUT")
    next();
  }
  else {
    res.json("Filme não existe")
  }
};

exports.create = (req, res) => {
  console.log("Proximo Id: " + checkLastId());
  req.body.id = checkLastId();
  //res.json(req.body)
  movies.push(req.body);
  res.json(movies);
}

exports.update = (req, res) => {
  let movie = movies.filter(movie => movie.id == req.params.id)[0]
  movie.name = req.body.name;
  movie.year = req.body.year;
  movie.rating = req.body.rating;
  res.json(movie);
}


exports.delete = (req, res) => {
  //console.log(req.params.id);
  if (!checkArray(req)) {
    //console.log("if ok");
    movies = movies.filter(movie => 
    {
      //console.log(movie.id,parseInt(req.params.id));
      return movie.id != parseInt(req.params.id)
    });
    //console.table(movies);
    res.json(movies);
  }
};


function checkArray(req) {
  //console.log("checkArray");
  return (movies.some(movie => 
    movie.name === req.body.name &&
    movie.year === req.body.year &&
    movie.rating === req.body.rating ||
    movie.id === req.params.id
  ))
}

function checkLastId() {
  //console.log("checkLastId")
  return ((movies[movies.length-1].id)+1)
}
