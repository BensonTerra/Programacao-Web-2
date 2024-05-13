const { raw } = require("mysql2");
const db = require("../models/index.js");
const Tutorial = db.tutorial;

//"Op" necessary for LIKE operator
const { Op, ValidationError, where } = require('sequelize');
const { link } = require("../routes/tutorials.routes.js");
const { model } = require("mongoose");


// Display list of all tutorials (with pagination)
exports.findAll = async (req, res) => {
  let { title } = req.query;

  const condition = title ? { title: { [Op.like]: `%${title}%`} } :null
  try {
    let tutorials = await Tutorial.findAll(
      {
        where: condition,
        raw: true,
      }
    )
    console.table(tutorials)

    tutorials.forEach(tutorial => {
      tutorial.links = [
        { rel:"self",href: `tutorials/${tutorial.id}`,method:"GET" },
        { rel:"delete",href: `tutorials/${tutorial.id}`,method:"DELETE" },
        { rel:"modify",href: `tutorials/${tutorial.id}`,method:"PUT" },
        ]
    })

    res.status(200).json({
      success: true,
      data: tutorials,
      links: [
        {
          "rel": "add-tutorial", 
          "href": `/tutorials`, 
          "method": "POST"}
      ]
    });
  }
  catch (err) {
    res.status(500).json({
      success: false, msg: err.message || "Some error occurred while retrieving the tutorials."
    })
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
        { "rel": "self", "href": `/tutorials/${newTutorial.id}`, "method": "GET" },
        { "rel": "delete", "href": `/tutorials/${newTutorial.id}`, "method": "DELETE" },
        { "rel": "modify", "href": `/tutorials/${newTutorial.id}`, "method": "PUT" },
      ]
    });
  }
  catch (err) {
    if (err instanceof ValidationError)
      res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
    else
      res.status(500).json({
        success: false, msg: err.message || "Some error occurred while creating the tutorial."
      });
  };
};

// List just one tutorial
exports.findOne = async (req, res) => {
  try {
    
    console.log("----------------------");
    console.log("findOne");
    console.log(req.params.idT)

    let tutorial = await Tutorial.findByPk(req.params.id, {
      include: [
        {
          model: db.comment,
          atributes: [ "id", "text"]
        },
        {
          model: db.tag,
          through: {atributes: []}
        }]
    }); console.log(tutorial)

    if(tutorial == null) {
      return res.status(404).json({ success: false, msg:`Couldnt find tutorial`})
    }

    return res.json({
      success: true,
      data: tutorial,
      links: [
          {"rel":"delete","href": `/tutorials/${tutorial.id}`,"method":"DELETE"},
          {"rel":"modify","href": `/tutorials/${tutorial.id}`,"method":"PUT"}
        ]
      }
    )
  }
  catch (err) {
    res.status(500).json({
      success: false, msg: `Error retrieving tutorial with ID ${req.params.idT}.`
    });
  };
};

// Update a tutorial
exports.update = async (req, res) => {
  try {
    let tutorial = await Tutorial.findByPk(req.params.idT); console.log(tutorial)

    if(tutorial == null) {
      return res.status(404).json({ success: false, msg:`Couldnt find tutorial`})
    }

    let affectRows = await tutorial.update(req.body, { where: { id: req.params.id}})

    if (affectRows[0] === 0) {
      return res.status(200).json({ success: true, msg:`tutorial updated successfully`})
    }
    
    return res.json({
      success: true,
      msg: `Tutorial with ID ${req.params.idT} was updated successfully.`
    });
  }
  catch (err) {
    if (err instanceof ValidationError)
      return res.status(400).json({ success: false, msg: err.errors.map(e => e.message) });
    res.status(500).json({
      success: false, msg: `Error retrieving tutorial with ID ${req.params.idT}.`
    });
  };
};

// Update one tutorial
exports.delete = async (req, res) => {
  try {
    let result = await Tutorial.destroy({where:{id: req.params.id}})

    if (result == 1) {
    return res.status(200).json({
        success: true, msg: `Tutorial with id ${req.params.idT} was successfully deleted!`
      });
    }
    return res.status(404).json({ success: false, msg:`Couldnt find tutorial`})
  }
  catch (err) {
    res.status(500).json({
      success: false, msg: `Error deleting tutorial with ID ${req.params.idT}.`
    });
  };
};

exports.addTag = async (req, res) => {
  try {
    let tutorial = await Tutorial.findByPk(req.params.id)
    if (tutorial === null) {
      return res.status(404).json({success: false, msg: `Couldn't find tag with id ${req.params.idTag}`
    })}
  }  catch (err) {
    res.status(500).json({
      success: false, msg: `Error retrieving tutorial with ID ${req.params.idT}.`
    });
  };
}
    