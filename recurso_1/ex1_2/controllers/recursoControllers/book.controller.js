const db = require("../../models/index.js");
const { ErrorHandler } = require("../../utils/error.js");

const Book = db.book; const Instance = db.instance;

const { Op, ValidationError } = require('sequelize');
const clear = require('clear');

exports.findAll = async (req, res, next) => {
    //res.status(400).json({ success: true, message:Book})
    clear();//console.log(Book)

    
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
        let book = await Book.findAndCountAll({
            where: condition,
            limit, offset,
            raw: true
        })
        console.log(book);

        /*
        // map HATEOAS links to each one of the book
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
            data: book.rows,

        });
    }
    catch (err) {
        next(err)
    }
    
};

exports.findOne = async (req, res, next) => {
    try {
        clear();
        
        // Obtém um único livro pelo ID, incluindo instâncias e gêneros associados
        let book = await Book.findByPk(req.params.idBook, {
            include: [
                {
                    model: db.instance, // Inclui instâncias associadas
                    as: 'instances', // Usa o alias definido para instâncias
                    attributes: ['status', 'returnDate', 'bookedBy']
                },
                {
                    model: db.genre, // Inclui gêneros associados
                    as: 'genres',
                    attributes: ['name'],
                    through: { attributes: [] } // Omite atributos da tabela de junção
                }
            ]
        });

        // Se o livro não for encontrado
        if (!book) {
            throw new ErrorHandler(404, `Cannot find any book with ID ${req.params.idBook}.`);
        }

        // Retorna o livro encontrado com suas associações
        return res.json({ 
            success: true, 
            data: book,
            links: [
                { rel: "self", href: `/books/${book.id}`, method: "GET" },
                { rel: "update", href: `/books/${book.id}`, method: "PUT" },
                { rel: "delete", href: `/books/${book.id}`, method: "DELETE" }
            ]
        });
        
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        clear();
        // Save Book in the database
        let newBook = await Book.create(req.body); console.log(req.body.title);
        let condition = req.body.title;
        let foundBook = await Book.findOne({ where: { title: condition } });
        let newInstance = await Instance.create(
            {
                "status": "Available",
                "bookedBy": null,
                "returnDate": null,
                "bookId": foundBook.id
            }
        );
        res.status(201).json({
            success: true, 
            msg: "Book successfully created.",
        });
    }
    catch (err) {
        // console.log(err.name) // err.name === 'SequelizeValidationError'
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
};

exports.update = async (req, res, next) => {
    try {
        // since Sequelize update() does not distinguish if a Book exists, first let's try to find one
        let book = await Book.findByPk(req.params.idBook);
        if (book === null)
            throw new ErrorHandler(404, `Cannot find any Book with ID ${req.params.idBook}.`);

        // obtains only a single entry from the table, using the provided primary key
        let affectedRows = await Book.update(req.body, { where: { id: req.params.idBook } })

        if (affectedRows[0] === 0) // check if the Book was updated (returns [0] if no data was updated)
            return res.status(200).json({
                success: true, msg: `No updates were made on Book with ID ${req.params.idBook}.`
            });

        return res.json({
            success: true,
            msg: `Book with ID ${req.params.idBook} was updated successfully.`
        });
    }
    catch (err) {
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
};