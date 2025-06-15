const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const User = db.user;
const Accommodation = db.accommodation; //usar para identificar a acomodação referente a reserva
const AccommodationBooking = db.accommodationBooking;
const Event = db.event;
const EventBooking = db.eventBooking;

//necessary for LIKE operator
const { Op, ValidationError, where } = require("sequelize");
const clear = require("clear");

/*---------------------------------------------------------------------*/
/*                        Admin/Facilitador/Estudante                  */
/*---------------------------------------------------------------------*/
exports.create = async (req, res, next) => {
  try {
    clear();

    // Verifica se já existe um usuário com o mesmo e-mail
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });
    //console.log(`existingUser: ${existingUser}`);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Já existe um usuário com esse e-mail.",
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
      ],
    });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    return res.status(400).json({
      success: false,
      msg: err.message,
      errors: err.errors ? err.errors.map((e) => e.message) : null,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    clear();
    if (!req.body || !req.body.username || !req.body.password)
      throw new ErrorHandler(
        400,
        "Failed! Must provide username and password."
      );

    let user = await User.findOne({
      where: { username: req.body.username },
    }); //console.log(`user: ${user.username}, ${user.email}, ${user.password}`);

    if (!user) throw new ErrorHandler(404, "User not found.");

    // decrypt psswd from DB and compare with the provided psswd in request
    // tests a string (password in body) against a hash (password in database)​
    const check = bcrypt.compareSync(req.body.password, user.password);

    if (!check) throw new ErrorHandler(401, "Invalid credentials!");

    //UNSAFE TO STORE EVERYTHING OF USER, including PSSWD
    // sign the given payload (user ID) into a JWT payload – builds JWT token, using secret key
    const token = jwt.sign({ id: user.id, role: user.role }, JWTconfig.SECRET, {
      expiresIn: "24h", // 24 hours
      // expiresIn: '20m' // 20 minutes
      // expiresIn: '1s' // 1 second
    });

    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso.",
      accessToken: token,
    });
  } catch (err) {
    if (err instanceof ValidationError)
      err = new ErrorHandler(
        400,
        err.errors.map((e) => e.message)
      );
    next(err);
  }
};

/*---------------------------------------------------------------------*/
/*                               Admin                                 */
/*---------------------------------------------------------------------*/
exports.findAllUsers = async (req, res, next) => {
  clear();
  
  let {
    username,
    email,
    role, 
    page, 
    size,  
  } = req.query;

  const condition = {
    ...(username ? { username: { [Op.like]: `%${username}%` } } : {}),
    ...(email ? { email: { [Op.like]: `%${email}%` } } : {}),
    ...(role ? { role: { [Op.like]: `%${role}%` } } : {}),
  }; 
  //console.log(condition);

  if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g))
    return res
      .status(400)
      .json({ message: "Page number must be 0 or a positive integer" });
  page = parseInt(page); // if OK, convert it into an integer

  // validate size
  if (size && !req.query.size.match(/^([1-9]\d*)$/g))
    return res.status(400).json({ message: "Size must be a positive integer" });
  size = parseInt(size); // if OK, convert it into an integer

  // limit -> number of rows to be retrieved
  // Offset -> number of rows to be offseted (not retrieved)
  const limit = size ? size : 5; // limit = size (default is 5)
  const offset = page ? page * limit : 0; // offset = page * size (start counting from page 0)

  try {

    let users = await User.findAndCountAll({
      where: condition,
      limit,
      offset,
      raw: true,
    });

    // map default response to desired response data structure
    return res.status(200).json({
      success: true,
      data: users.rows,
      links: [
        { rel: "self", href: `/users`, method: "GET" }
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.findOneUser = async (req, res, next) => {
  try {
    clear();
    const userId = req.params.idUser; //console.log(`userId: ${userId}`);

    // Busca o utilizador por chave primária SEM dependência das relações
    const user = await User.findByPk(userId)
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
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOneUser = async (req, res, next) => {
  try {
    clear();
    const userId = req.params.idUser; //console.log(`userId: ${userId}`);

    // Busca o utilizador por chave primária SEM dependência das relações
    const user = await User.findByPk(userId)
    // Se não encontrar o user, lança erro 404
    if (!user) {
      throw new ErrorHandler(404, `Cannot find any user with ID ${userId}.`);
    }

    user.role = req.body.role || user.role;

    // Retorna os dados do utilizador com links HATEOAS
    return res.json({
      success: true,
      data: `User with ID ${userId} updated successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOneUser = async (req, res, next) => {
  try {
    clear();

    const userId = req.params.idUser; //console.log(`userId: ${userId}`);

    // Impede o usuário de excluir a si mesmo
    if (req.loggedUserId = userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own user account.',
      });
    }

    // Busca o utilizador por chave primária SEM dependência das relações
    const user = await User.findByPk(userId)
    // Se não encontrar o user, lança erro 404
    if (!user) {
      throw new ErrorHandler(404, `Cannot find any user with ID ${userId}.`);
    }

    user.destroy();

    // Retorna os dados do utilizador com links HATEOAS
    return res.json({
      success: true,
      data: `User with ID ${userId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/*---------------------------------------------------------------------*/
/*                        accommodationBookings                        */
/*---------------------------------------------------------------------*/
exports.findAllMyAccommodationBookings = async (req, res, next) => {
  clear();
  
  const loggedUserId = req.loggedUserId; console.log(loggedUserId);  

  let accommodationBookings = await AccommodationBooking.findAndCountAll({
    where: {
      userId: loggedUserId,
    },
    order: [["from", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    message: "AccommodationBookings retrieved successfully.",
    data: accommodationBookings.rows,
  });
};

exports.findOneMyAccommodationBooking = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const accommodationBookingId = req.params.idAccommodationBooking;

    if (!accommodationBookingId) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodationBookingId with ID ${accommodationBookingId}.`
      );
    }

    const accommodationBooking = await AccommodationBooking.findOne({
      where: {
        id: accommodationBookingId,
        userId: loggedUserId,
      },
    });

    if (!accommodationBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodationBooking with ID ${accommodationBookingId}.`
      );
    }

    if (accommodationBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this accommodationBooking.`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully.",
      data: accommodationBooking,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOneMyAccommodationBooking = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const accommodationBookingId = req.params.idAccommodationBooking;

    const accommodationBooking = await AccommodationBooking.findOne({
      where: {
        id: accommodationBookingId,
        userId: loggedUserId,
      },
    });

    if (!accommodationBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodationBooking with ID ${accommodationBookingId}.`
      );
    }

    if (accommodationBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this accommodationBooking.`
      );
    }

    accommodationBooking.from = req.body.from || accommodationBooking.from;
    accommodationBooking.to = req.body.to || accommodationBooking.to;
    accommodationBooking.numPeople =
      req.body.numPeople || accommodationBooking.numPeople;
    accommodationBooking.status = "pendente";
    accommodationBooking.commentary = "";

    await accommodationBooking.save();

    return res.status(200).json({
      success: true,
      message: `AccommodationBooking with ID ${accommodationBookingId} updated successfully.`,
      data: accommodationBooking,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOneMyAccommodationBooking = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const accommodationBookingId = req.params.idAccommodationBooking;

    const accommodationBooking = await AccommodationBooking.findOne({
      where: {
        id: accommodationBookingId,
        userId: loggedUserId,
      },
    });

    if (!accommodationBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodationBooking with ID ${accommodationBookingId}.`
      );
    }

    if (accommodationBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to delete this accommodationBooking.`
      );
    }

    await accommodationBooking.destroy({
      where: {
        id: accommodationBookingId,
        userId: loggedUserId,
      },
    });

    return res.status(200).json({
      success: true,
      message: `AccommodationBooking with ID ${accommodationBookingId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/*---------------------------------------------------------------------*/
/*                            eventBookings                            */
/*---------------------------------------------------------------------*/
exports.findAllMyEventBookings = async (req, res, next) => {
  clear();

  const loggedUserId = req.loggedUserId;

  try {
    let eventBookings = await EventBooking.findAndCountAll({
      where: {
        userId: loggedUserId,
      },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'available_from'],
        },
      ],
      order: [
        [
          { model: Event, as: 'event' }, 'available_from', 'DESC'
        ]
      ],
    });

    return res.status(200).json({
      success: true,
      message: "EventBookings retrieved successfully.",
      data: eventBookings.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.findOneMyEventBooking = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const eventBookingId = req.params.idEventBooking;

    if (!eventBookingId) {
      throw new ErrorHandler(
        404,
        `Cannot find any eventBookingId with ID ${eventBookingId}.`
      );
    }

    const eventBooking = await EventBooking.findOne({
      where: {
        id: eventBookingId,
        userId: loggedUserId,
      },
    });

    if (!eventBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any eventBooking with ID ${eventBookingId}.`
      );
    }

    if (eventBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this eventBooking.`
      );
    }

    return res.status(200).json({
      success: true,
      message: "EventBookings retrieved successfully.",
      data: eventBooking,
    });
  } catch (err) {
    next(err);
  }
}

exports.deleteOneMyEventBooking = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const eventBookingId = req.params.idAccommodationBooking;

    const eventBooking = await EventBooking.findOne({
      where: {
        id: eventBookingId,
        userId: loggedUserId,
      },
    });

    if (!eventBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any eventBooking with ID ${eventBookingId}.`
      );
    }

    if (eventBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to delete this eventBooking.`
      );
    }

    return res.status(200).json({
      success: true,
      message: `EventBooking with ID ${eventBookingId} delete successfully.`,
      data: eventBooking,
    });
  } catch (err) {
    next(err);
  }
}

