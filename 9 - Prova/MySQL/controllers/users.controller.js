const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/db.js");
const User = db.user;

const { Op, ValidationError, where } = require("sequelize");
const clear = require("clear");

// exports.create = async (req, res, next) => {

// exports.login = async (req, res, next) => {