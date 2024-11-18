const db = require("../../models/index.js");
const { ErrorHandler } = require("../../utils/error.js");

const Instance = db.instance;
const Book = db.book

const { Op, ValidationError, where } = require('sequelize');
const clear = require('clear');

exports.findAll = async (req, res, next) => {
    clear();

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
        let instance = await Instance.findAndCountAll({
            where: condition,
            limit, offset,
            raw: true
        })
        console.log(instance);

        /*
        // map HATEOAS links to each one of the tutorials
        book.rows.forEach(book => {
            book.links = [
                { rel: "self", href: `/books/${book.id}`, method: "GET" },
                { rel: "delete", href: `/books/${book.id}`, method: "DELETE" },
                { rel: "modify", href: `/books/${book.id}`, method: "PUT" },
            ]
        });
        */

        // map default response to desired response data structure
        return res.status(200).json({
            success: true,
            data: instance.rows,

        });
    }
    catch (err) {
        next(err)
    }
    
};

exports.create = async (req, res, next) => {
    try {
        clear()
        // Save Book in the database
        let newInstance = await Instance.create(
            {
                "status": req.body.status,
                "bookedBy": null,
                "returnDate": null,
                "bookId": req.body.bookId
            }
        ); console.log(newInstance)

        if (!req.body.bookId) {
            return res.status(400).json({ 
                success: false, 
                message: 'A bookId is required to create an instance.'
            });
        }

        res.status(201).json({
            success: true,
            msg: "Instance successfully created.", 
            data: newInstance,
            links: [
                { rel: "self", href: `/instances/${newInstance.id}`, method: "GET" },
                { rel: "modify", href: `/instances/${newInstance.id}`, method: "PUT" },
                { rel: "delete", href: `/instances/${newInstance.id}`, method: "DELETE" },
            ]
        });
    }
    catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
};

exports.reserveInstance = async(req, res, next) => {
    try {
        clear()
        // Save Book in the database
        const condition = req.body.title
        let bookToReserve = await Book.findOne({
            where: condition
        }); console.log(bookToReserve)

        if (!req.body.bookId) {
            return res.status(400).json({ 
                success: false, 
                message: 'A bookId is required to create an instance.'
            });
        }

        res.status(201).json({
            success: true,
            msg: "Instance successfully created.", 
            data: bookToReserve,
        });
    }
    catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
}