const db = require("../models/index.js");
const { ErrorHandler } = require("../utils/error.js");

const Book = db.books;

//necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');
const clear = require('clear');
