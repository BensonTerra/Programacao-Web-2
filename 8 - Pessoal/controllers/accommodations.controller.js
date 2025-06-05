const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const Accommodation = db.accommodation;

//necessary for LIKE operator
const { Op, ValidationError } = require('sequelize');
const clear = require('clear');

exports.create = async (req, res, next) => {
    try {
        clear();

        // Verifica se já existe um usuário com o mesmo e-mail
        const existingUser = await User.findOne({ where: { email: req.body.email } }); 
        //console.log(`existingUser: ${existingUser}`);
        

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Já existe um usuário com esse e-mail."
            });
        }

        //console.log(`req.body: ${req.body.username}, ${req.body.email}, ${req.body.password}`);

        // Cria o novo usuário
        let user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
        });
        //console.log(`user: ${user}`);
        

        // Retorna o usuário criado com os links HATEOAS
        return res.status(201).json({
            success: true,
            data: user,
            links: [
                { rel: "self", href: `/users/${user.id}`, method: "GET" },
                { rel: "modify", href: `/users/${user.id}`, method: "PUT" },
                { rel: "delete", href: `/users/${user.id}`, method: "DELETE" },
            ]
        });
    } catch (err) {
        console.error("Erro ao criar usuário:", err);
        return res.status(400).json({
            success: false,
            msg: err.message,
            errors: err.errors ? err.errors.map(e => e.message) : null
        });
    }

};

//patch
//delete

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
        let Accomodations = await Accommodation.findAndCountAll({
            where: condition,
            limit, offset,
            raw: true
        });

        /* map HATEOAS links to each one of the Accomodations
        Accomodations.rows.forEach(Accomodation => {
            Accomodation.links = [
                { rel: "self", href: `/Accomodations/${Accomodation.id}`, method: "GET" },
                { rel: "modify", href: `/Accomodations/${Accomodation.id}`, method: "PUT" },
                { rel: "delete", href: `/Accomodations/${Accomodation.id}`, method: "DELETE" },
            ]
        });*/

        // map default response to desired response data structure
        return res.status(200).json({
            success: true,
            data: Accomodations.rows,
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
        const accommodationId = req.params.idAccommodation; console.log(`AccomodationId: ${accommodationId}`);
        

        // Busca o utilizador por chave primária SEM dependência das relações
        const accommodation = await Accommodation.findByPk(accommodationId, {
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

        // Se não encontrar o Accomodation, lança erro 404
        if (!accommodation) {
            throw new ErrorHandler(404, `Cannot find any accommodation with ID ${accommodationId}.`);
        }

        // Retorna os dados do utilizador com links HATEOAS
        return res.json({
            success: true,
            data: accommodation,
            links: [
                { rel: "modify", href: `/Accomodations/${accommodation.id}`, method: "PUT" },
                { rel: "delete", href: `/Accomodations/${accommodation.id}`, method: "DELETE" },
            ]
        });
    } catch (err) {
        next(err);
    }
};

exports.findAllByFacilitador = async (req, res, next) => {
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

    

}