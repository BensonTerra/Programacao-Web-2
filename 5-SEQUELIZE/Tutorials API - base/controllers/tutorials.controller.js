const db = require("../models/index.js");
const Tutorial = db.tutorial;

//"Op" necessary for LIKE operator
const { Op, ValidationError, where } = require("sequelize");

// Display list of all tutorials (with pagination)
exports.findAll = async (req, res) => {
  //const condition = title ? {title: {[Op.like]: `%${title}%`}} : null

  try {
    let tutorials = await Tutorial.findAll(
      {
        /*where: condition,*/
        raw: true,
      }
    );
    tutorials.forEach((tut) => {
      tut.links = [
        { rel: "self", href: `/tutorials/${tut.id}`, method: "GET" },
        { rel: "delete", href: `/tutorials/${tut.id}`, method: "DELETE" },
        { rel: "modify", href: `/tutorials/${tut.id}`, method: "PUT" },
      ];
    });
    res.status(200).json({
      success: true,
      data: tutorials,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving the tutorials.",
    });
  }
};

// Handle tutorial create on POST
exports.create = async (req, res) => {
  try {
    // save Tutorial in the database
    let newTutorial = await Tutorial.create(req.body);
    // return success message with ID
    res.status(201).json({
      success: true,
      msg: "Tutorial successfully created.",
      links: [
        { rel: "self", href: `/tutorials/${newTutorial.id}`, method: "GET" },
        {
          rel: "delete",
          href: `/tutorials/${newTutorial.id}`,
          method: "DELETE",
        },
        { rel: "modify", href: `/tutorials/${newTutorial.id}`, method: "PUT" },
      ],
    });
  } catch (err) {
    if (err instanceof ValidationError)
      res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    else
      res.status(500).json({
        success: false,
        msg: err.message || "Some error occurred while creating the tutorial.",
      });
  }
};

// List just one tutorial
exports.findOne = async (req, res) => {
  try {
    // Nota: Encontrar um tutorial através da sua chave primária.
    let tutorial = await Tutorial.findByPk(req.params.idT, {
      include: [
        {
          model: db.comment,
          attributes: ["id", "text"],
        },
        {
          model: db.tag,
          through: { attributes: [] },
        },
      ],
    });
    if (tutorial == null) {
      res.status(404).json({
        success: false,
        msg: `Could not find any tutorial with ID ${req.params.idT}.`,
      });
    }
    return res.json({
      success: true,
      data: tutorial,
      links: [
        { rel: "delete", href: `/tutorials/${tutorial.id}`, method: "DELETE" },
        { rel: "modify", href: `/tutorials/${tutorial.id}`, method: "PUT" },
      ],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: `Error retrieving tutorial with ID ${req.params.idT}.`,
    });
  }
};

// Update a tutorial
exports.update = async (req, res) => {
  try {
    // Nota: Atualizar tutorial
    Tutorial.update(req.body, { where: { id: req.params.idT } });
    return res.json({
      success: true,
      msg: `Tutorial with ID ${req.params.idT} was updated successfully.`,
    });
  } catch (err) {
    if (err instanceof ValidationError)
      return res
        .status(400)
        .json({ success: false, msg: err.errors.map((e) => e.message) });
    res.status(500).json({
      success: false,
      msg: `Error retrieving tutorial with ID ${req.params.idT}.`,
    });
  }
};

// Update one tutorial
exports.delete = async (req, res) => {
  try {
    // Nota: Apagar um tutorial
    Tutorial.destroy({ where: { id: req.params.idT } });
    return res.status(200).json({
      success: true,
      msg: `Tutorial with id ${req.params.idT} was successfully deleted!`,
    });
  } catch (err) {
    -res.status(500).json({
      success: false,
      msg: `Error deleting tutorial with ID ${req.params.idT}.`,
    });
  }
};

exports.addTag = async (req, res) => {
  try {
    let tutorial = await Tutorial.findByPk(req.params.idT);
    if (tutorial == null) {
      res.status(404).json({
        success: false,
        msg: `Could not find any tutorial with ID ${req.params.idT}.`,
      });
    }

    let result = await tutorial.addTag(tag);

    if (result == undefined) {
      if (tutorial == null) {
        res.status(409).json({
          success: false,
          msg: `Tutorial id ${req.params.idT} already has tag.`,
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: `Error retrieving tutorial with ID ${req.params.idT}.`,
    });
  }
};
