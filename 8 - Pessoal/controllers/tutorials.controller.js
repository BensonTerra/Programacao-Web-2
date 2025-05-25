const db = require("../models/index.js");
const { ErrorHandler } = require("../utils/error.js");

const Tutorial = db.tutorial;

//necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');
const clear = require('clear');

// Display list of all tutorials (with pagination)
exports.findAll = async (req, res, next) => {
    //get data from request query string (if not existing, they will be undefined)
    console.log(req.query)
    let { page, size, title } = req.query;

    // validate page
    if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g))
        return res.status(400).json({ message: 'Page number must be 0 or a positive integer' });
    page = parseInt(page); // if OK, convert it into an integer

    // validate size
    if (size && !req.query.size.match(/^([1-9]\d*)$/g))
        return res.status(400).json({ message: 'Size must be a positive integer' });
    size = parseInt(size); // if OK, convert it into an integer

    // Sequelize function findAndCountAll parameters: 
    //      limit -> number of rows to be retrieved
    //      offset -> number of rows to be offseted (not retrieved)
    const limit = size ? size : 3;          // limit = size (default is 3)
    const offset = page ? page * limit : 0; // offset = page * size (start counting from page 0)

    // search by title require to build a query with the operator L
    const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;


    try {
        let tutorials = await Tutorial.findAndCountAll({
            where: condition,
            limit, offset,
            raw: true
        })

        // map HATEOAS links to each one of the tutorials
        tutorials.rows.forEach(tut => {
            tut.links = [
                { rel: "self", href: `/tutorials/${tut.id}`, method: "GET" },
                { rel: "delete", href: `/tutorials/${tut.id}`, method: "DELETE" },
                { rel: "modify", href: `/tutorials/${tut.id}`, method: "PUT" },
            ]
        });

        // map default response to desired response data structure
        return res.status(200).json({
            success: true,
            data: tutorials.rows,
            links: [
                { rel: "create-tutorial", href: `/tutorials`, method: "POST" }
            ]

        });
    }
    catch (err) {
        next(err)
    }
};
