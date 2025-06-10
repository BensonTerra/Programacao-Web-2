const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");

const Event = db.event;
const eventBooking = db.eventBooking;
const User = db.user;

const { Op, ValidationError } = require("sequelize");
const clear = require("clear");

exports.findAll = async (req, res, next) => {
  clear();
  //get data from request query string (if not existing, they will be undefined)
  let { 
    creatorName,
    title,
    location,
    price,
    start_date,
    end_date,
    page,
    size,
  } = req.query;

  let include = [];

  if (creatorName) {
    include.push({
      model: User,
      as: "creator",
      where: {
        username: { [Op.like]: `%${creatorName}%` },
      },
      attributes: [],
    });
  } //console.log(JSON.stringify(include, null, 2));

  const condition = {
    ...(title ? { title: { [Op.like]: `%${title}%` } } : {}),
  };
  //console.log(condition);

  if (start_date && end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Verifica se a acomodação está disponível no período
    condition.available_from = { [Op.lte]: startDate };
    condition.available_to = { [Op.gte]: endDate };

    // Verifica se já há reservas no mesmo período
    const overlappingBookings = await eventBooking.findAll({
      attributes: ["eventId"],
      where: {
        [Op.or]: [
          {
            data_inicio: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            data_fim: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            data_inicio: {
              [Op.lte]: startDate,
            },
            data_fim: {
              [Op.gte]: endDate,
            },
          },
        ],
      },
      raw: true,
    });

    const busyIds = overlappingBookings.map((a) => a.eventId);

    if (busyIds.length > 0) {
      condition.id = {
        [Op.notIn]: busyIds,
      };
    }
  }

  // validate page
  if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g))
    return res
      .status(400)
      .json({ message: "Page number must be 0 or a positive integer" });
  page = parseInt(page); // if OK, convert it into an integer

  // validate size
  if (size && !req.query.size.match(/^([1-9]\d*)$/g))
    return res.status(400).json({ message: "Size must be a positive integer" });
  size = parseInt(size); // if OK, convert it into an integer

  // Sequelize function findAndCountAll parameters:
  //      limit -> number of rows to be retrieved
  //      offset -> number of rows to be offseted (not retrieved)
  const limit = size ? size : 5; // limit = size (default is 5)
  const offset = page ? page * limit : 0; // offset = page * size (start counting from page 0)

  try {
    let Events = await Event.findAndCountAll({
      where: condition,
      include,
      limit,
      offset,
      raw: true,
    });

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
        {
          rel: "self",
          href: `/events`,
          method: "GET",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    clear();
    const eventId = req.params.idEvent;
    console.log(`EventId: ${eventId}`);

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
      throw new ErrorHandler(
        404,
        `Cannot find any accommodation with ID ${eventId}.`
      );
    }

    // Retorna os dados do utilizador com links HATEOAS
    return res.json({
      success: true,
      data: accommodation,
      links: [
        { rel: "modify", href: `/Events/${accommodation.id}`, method: "PUT" },
        {
          rel: "delete",
          href: `/Events/${accommodation.id}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.findAllMyEvents = async (req, res, next) => {
  try {
    clear();
    const userId = req.loggedUserId; console.log(`UserId: ${userId}`);

    let Events = await Event.findAndCountAll({
      where: { createdByUserId: userId },
      raw: true,
    }); //console.log(events);

    if (!Events || Events.lenght === 0) {
      throw new ErrorHandler(404, "No events found for this user.");
    }

    // formata a data para 'YYYY-MM-DD'
    const formatDate = (isoDate) => {
      if (!isoDate) return null;
      return new Date(isoDate).toISOString().split('T')[0];
    }

    // mapeia as acomodações e formata as datas
    const formattedData = Events.rows.map(eve => ({
      ...eve,
      available_from: formatDate(eve.available_from),
      available_to: formatDate(eve.available_to),
    }));

    // Retorna os dados das acomodações com links HATEOAS
    return res.status(200).json({
      success: true,
      data: formattedData,
      links: [
        {
          rel: "self",
          href: `/accommodations/myEvents`,
          method: "GET",
        },
      ],
    });

  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    clear();

    let newEvent = await Event.create({
      createdByUserId: req.loggedUserId,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      price: req.body.price,
      available_from: req.body.startDate,
      available_to: req.body.endDate,
    });

    return res.status(200).json({
      success: true,
      data: newEvent,
      links: [
        {
          rel: "modify",
          href: `/events/${newEvent.id}`,
          method: "PUT",
        },
        {
          rel: "delete",
          href: `/events/${newEvent.id}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    console.error("Erro ao criar event:", err);
    return res.status(400).json({
      success: false,
      msg: err.message,
      errors: err.errors ? err.errors.map((e) => e.message) : null,
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    clear();
    const eventId = req.params.idEvent;
    //console.log(`eventId: ${eventId}`);

    // Busca a acomodação por chave primária
    const event = await Event.findByPk(eventId);

    //Obter user logado para garantir que o utilizador autenticado é o dono da acomodação
    const loggedUserId = req.loggedUserId;
    //console.log(`Logged UserId: ${loggedUserId}`);

    // Se não encontrar a acomodação, lança erro 404
    if (!event) {
      throw new ErrorHandler(
        404,
        `Cannot find any event with ID ${eventId}.`
      );
    }

    if (event.createdByUserId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this event.`
      );
    }

    // Atualiza os campos da acomodação com os dados do corpo da requisição
    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.location = req.body.location || event.location;
    event.price = req.body.price || event.price;
    event.available_from = req.body.startDate || event.available_from;
    event.available_to = req.body.endDate || event.available_to;

    // Salva as alterações na base de dados
    await event.save();

    return res.status(200).json({
      success: true,
      data: `Event with ID ${eventId} updated successfully.`,
      links: [
        {
          rel: "self",
          href: `/events/${event.id}`,
          method: "GET",
        },
        {
          rel: "delete",
          href: `/events/${event.id}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    clear();
    const eventId = req.params.idEvent; console.log(`eventId: ${eventId}`);

    // Busca a acomodação por chave primária
    const event = await Event.findByPk(eventId);

    //Obter user logado para garantir que o utilizador autenticado é o dono da acomodação
    const loggedUserId = req.loggedUserId; //console.log(`Logged UserId: ${loggedUserId}`);

    // Se não encontrar a acomodação, lança erro 404
    if (!event) {
      throw new ErrorHandler(
        404,
        `Cannot find any event with ID ${eventId}.`
      );
    }

    if (event.createdByUserId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to delete this event.`
      );
    }

    event.destroy({
      where: {
        id: eventId,
        createdByUserId: loggedUserId,
      },
    });

    return res.status(200).json({
      success: true,
      data: `Event with ID ${eventId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};
