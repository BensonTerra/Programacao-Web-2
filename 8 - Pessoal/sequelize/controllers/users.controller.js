const db = require("../models/index.js");
const { ErrorHandler } = require("../utils/error.js");

const User = db.user;

//necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');
const clear = require('clear');

exports.findAll = async (req, res, next) => {
    clear();
    //get data from request query string (if not existing, they will be undefined)
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
        let users = await User.findAndCountAll({
            where: condition,
            limit, offset,
            raw: true
        })

        /* map HATEOAS links to each one of the users
        users.rows.forEach(user => {
            user.links = [
                { rel: "self", href: `/users/${user.id}`, method: "GET" },
                { rel: "modify", href: `/users/${user.id}`, method: "PUT" },
                { rel: "delete", href: `/users/${user.id}`, method: "DELETE" },
            ]
        });*/

        // map default response to desired response data structure
        return res.status(200).json({
            success: true,
            data: users.rows,
            links: [
                { rel: "GET AllUsers", href: `/users`, method: "GET" }
            ]

        });
    }
    catch (err) {
        next(err)
    }
};

exports.findOne = async (req, res, next) => {
    try {
        clear();
        const userId = req.params.idUser; console.log(`userId: ${userId}`);
        

        // Busca o utilizador por chave primária SEM dependência das relações
        const user = await User.findByPk(userId, {
            // Deixa a estrutura de include comentada para uso futuro
            /*
            include: [
                {
                    model: db.comment,
                    attributes: ['id', 'text']
                },
                {
                    model: db.tag,
                    attributes: ['name'],
                    through: { attributes: [] }
                }
            ]
            */
        });

        // Se não encontrar o user, lança erro 404
        if (!user) {
            throw new ErrorHandler(404, `Cannot find any user with ID ${userId}.`);
        }

        // Retorna os dados do utilizador com links HATEOAS
        return res.json({
            success: true,
            data: user,
            links: [
                { rel: "modify", href: `/users/${user.id}`, method: "PUT" },
                { rel: "delete", href: `/users/${user.id}`, method: "DELETE" },
            ]
        });
    } catch (err) {
        next(err);
    }
};
