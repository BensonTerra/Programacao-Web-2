const db = require("../models/index.js");
const { ErrorHandler } = require("../utils/error.js");

const Book = db.books;
const BookGenre = db.bookGenres;

// necessary for LIKE operator
const { ValidationError } = require('sequelize');
const clear = require('clear')

