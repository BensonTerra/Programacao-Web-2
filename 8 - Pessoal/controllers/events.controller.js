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

exports.findAllEvents = async (req, res, next) => {
  clear();

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
  }

  const condition = {
    ...(title ? { title: { [Op.like]: `%${title}%` } } : {}),
  };

  if (start_date && end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    condition.available_from = { [Op.lte]: startDate };
    condition.available_to = { [Op.gte]: endDate };

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

  if (page && !req.query.page.match(/^(0|[1-9]\d*)$/g))
    return res
      .status(400)
      .json({ message: "Page number must be 0 or a positive integer" });
  page = parseInt(page); 

  if (size && !req.query.size.match(/^([1-9]\d*)$/g))
    return res.status(400).json({ message: "Size must be a positive integer" });
  size = parseInt(size);

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

exports.findOneEvent = async (req, res, next) => {
  try {
    clear();
    const eventId = req.params.idEvent;

    const event = await Event.findByPk(eventId, {});

    if (!event) {
      throw new ErrorHandler(
        404,
        `Cannot find any event with ID ${eventId}.`
      );
    }
    
    return res.json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

/*-------------------------------------------------------------------------------*/
/*                                 /myEvents/                                    */
/*-------------------------------------------------------------------------------*/
exports.findAllMyEvents = async (req, res, next) => {
  try {
    clear();
    const userId = req.loggedUserId;

    let Events = await Event.findAndCountAll({
      where: { createdByUserId: userId },
      raw: true,
    });

    if (!Events || Events.lenght === 0) {
      throw new ErrorHandler(404, "No events found for this user.");
    }

    const formatDate = (isoDate) => {
      if (!isoDate) return null;
      return new Date(isoDate).toISOString().split('T')[0];
    }

    const formattedData = Events.rows.map(eve => ({
      ...eve,
      available_from: formatDate(eve.available_from),
      available_to: formatDate(eve.available_to),
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      links: [
        {
          rel: "self",
          href: `/events/myEvents`,
          method: "GET",
        },
      ],
    });

  } catch (err) {
    next(err);
  }
};

exports.createOneMyEvent = async (req, res, next) => {
  try {
    clear();
    
    let newEvent = await Event.create({
      createdByUserId: req.loggedUserId,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      price: req.body.price,
      available_from: req.body.available_from,
      available_to: req.body.available_to,
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

exports.updateOneMyEvent = async (req, res, next) => {
  try {
    clear();
    const eventId = req.params.idEvent;

    const event = await Event.findByPk(eventId);

    const loggedUserId = req.loggedUserId;

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

    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.location = req.body.location || event.location;
    event.price = req.body.price || event.price;
    event.available_from = req.body.available_from || event.available_from;
    event.available_to = req.body.available_to || event.available_to;

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

exports.deleteOneMyEvent = async (req, res, next) => {
  try {
    clear();
    const eventId = req.params.idEvent;

    const event = await Event.findByPk(eventId);

    const loggedUserId = req.loggedUserId;

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
