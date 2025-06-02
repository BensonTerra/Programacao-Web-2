const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const User = db.user;

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

exports.login = async (req, res, next) => {
    try {
        clear();
        if (!req.body || !req.body.username || !req.body.password)
            throw new ErrorHandler(400, "Failed! Must provide username and password.");

        let user = await User.findOne({
            where: { username: req.body.username }
        }); //console.log(`user: ${user.username}, ${user.email}, ${user.password}`);
        
        if (!user)
            throw new ErrorHandler(404, "User not found.");

        // decrypt psswd from DB and compare with the provided psswd in request
        // tests a string (password in body) against a hash (password in database)​
        const check = bcrypt.compareSync(
            req.body.password, user.password
        );

        if (!check)
            throw new ErrorHandler(401, "Invalid credentials!");

        //UNSAFE TO STORE EVERYTHING OF USER, including PSSWD
        // sign the given payload (user ID) into a JWT payload – builds JWT token, using secret key
        const token = jwt.sign({ id: user.id, role: user.role },
            JWTconfig.SECRET, {
            // expiresIn: '24h' // 24 hours
            expiresIn: '20m' // 20 minutes
            // expiresIn: '1s' // 1 second
        });
    
        return res.status(200).json({
            success: true,
            message: "Login realizado com sucesso.",
            accessToken: token
        });


    } catch (err) {
        if (err instanceof ValidationError)
            err = new ErrorHandler(400, err.errors.map(e => e.message));
        next(err)
    };
};

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
                { rel: "GET All_Users", href: `/users`, method: "GET" }
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
        const userId = req.params.idUser; //console.log(`userId: ${userId}`);
        

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
