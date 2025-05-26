const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const Event = db.events;

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
        let Events = await Event.findAndCountAll({
            where: condition,
            limit, offset,
            raw: true
        })

        /* map HATEOAS links to each one of the Events
        Events.rows.forEach(Event => {
            Event.links = [
                { rel: "self", href: `/Events/${Event.id}`, method: "GET" },
                { rel: "modify", href: `/Events/${Event.id}`, method: "PUT" },
                { rel: "delete", href: `/Events/${Event.id}`, method: "DELETE" },
            ]
        });*/

        // map default response to desired response data structure
        return res.status(200).json({
            success: true,
            data: Events.rows,
            links: [
                { rel: "GET All_Accommodations", href: `/accommodations`, method: "GET" }
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
        const eventId = req.params.idEvent; console.log(`EventId: ${eventId}`);
        

        // Busca o utilizador por chave primária SEM dependência das relações
        const accommodation = await Event.findByPk(eventId, {
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

        // Se não encontrar o Event, lança erro 404
        if (!accommodation) {
            throw new ErrorHandler(404, `Cannot find any accommodation with ID ${eventId}.`);
        }

        // Retorna os dados do utilizador com links HATEOAS
        return res.json({
            success: true,
            data: accommodation,
            links: [
                { rel: "modify", href: `/Events/${accommodation.id}`, method: "PUT" },
                { rel: "delete", href: `/Events/${accommodation.id}`, method: "DELETE" },
            ]
        });
    } catch (err) {
        next(err);
    }
};