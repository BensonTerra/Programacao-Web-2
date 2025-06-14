const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const Accommodation = db.accommodation;
const accommodationBooking = db.accommodationBooking;
const AccommodationRating =db.accommodationRating
const User = db.user;

const { Sequelize, Op, ValidationError } = require("sequelize");
const clear = require("clear");

exports.findAllAccommodations = async (req, res, next) => {
  clear();
  //get data from request query string (if not existing, they will be undefined)
  let {
    creatorName,
    title,
    location,
    room_type,
    bedCount,
    price_per_night,
    start_date,
    end_date,
    page,
    size,
  } = req.query;
  //console.log(`Query Params: ${JSON.stringify(req.query)}`);

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

  // search by title require to build a query with the operator L
  const condition = {
    ...(title ? { title: { [Op.like]: `%${title}%` } } : {}),
    ...(location ? { location: { [Op.like]: `%${location}%` } } : {}),
    ...(room_type ? { room_type: { [Op.like]: `%${room_type}%` } } : {}),
    ...(bedCount ? { bed_count: bedCount } : {}),
    ...(price_per_night ? { price_per_night: price_per_night } : {}),
  };

  //console.log(condition);

  if (start_date && end_date) {
    const startDate = new Date(start_date);
    console.log(`startDate ${startDate}`);
    const endDate = new Date(end_date);
    console.log(`endDate ${endDate}`);

    // Verifica se a acomodação está disponível no período
    condition.available_from = { [Op.lte]: startDate };
    condition.available_to = { [Op.gte]: endDate };

    // Verifica se já há reservas no mesmo período
    const overlappingBookings = await accommodationBooking.findAll({
      attributes: ["accommodationId"],
      where: {
        [Op.or]: [
          {
            from: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            to: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            from: {
              [Op.lte]: startDate,
            },
            to: {
              [Op.gte]: endDate,
            },
          },
        ],
      },
      raw: true,
    });

    const busyIds = overlappingBookings.map((a) => a.accommodationId);

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
  // limit -> number of rows to be retrieved
  // Offset -> number of rows to be offseted (not retrieved)
  const limit = size ? size : 5; // limit = size (default is 5)
  const offset = page ? page * limit : 0; // offset = page * size (start counting from page 0)

  try {
    let Accommodations = await AccommodationRating.findAndCountAll({
      where: condition,
      include,
      attributes: {
        include: [
          [
            Sequelize.literal(`( 
              SELECT AVG("rating")
              FROM "AccommodationRatings"
              WHERE "AccommodationRatings"."accommodationId" = "Accommodations"."id"
            )`),
            "rating",
          ],
        ],
      },
      limit,
      offset,
      raw: true,
    });

    /* map HATEOAS links to each one of the accommodations
    accommodations.rows.forEach(accommodation => {
      accommodation.links = [
        { rel: "self", href: `/accommodations/${accommodation.id}`, method: "GET" },
        { rel: "modify", href: `/accommodations/${accommodation.id}`, method: "PUT" },
        { rel: "delete", href: `/accommodations/${accommodation.id}`, method: "DELETE" },
      ]
    });
    */

    // formata a data para 'YYYY-MM-DD'
    const formatDate = (isoDate) => {
      if (!isoDate) return null;
      return new Date(isoDate).toISOString().split("T")[0];
    };

    // mapeia as acomodações e formata as datas
    const formattedData = Accommodations.rows.map((acc) => ({
      ...acc,
      available_from: formatDate(acc.available_from),
      available_to: formatDate(acc.available_to),
      rating:
        acc.rating === null
          ? "Sem avaliações"
          : parseFloat(acc.rating).toFixed(2),
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      links: [
        {
          rel: "self",
          href: `/accommodations`,
          method: "GET",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.findOneAccommodation = async (req, res, next) => {
  try {
    clear();
    const accommodationId = req.params.idAccommodation;

    const accommodation = await AccommodationRating.findByPk(accommodationId, {
      // Deixa a estrutura de include comentada para uso futuro
      /*
      include: [
        {
          model: db.comment,
          attributes: ["id", "text"],
        },
        {
          model: db.tag,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      */
    });

    if (!accommodation) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodation with ID ${accommodationId}.`
      );
    }

    return res.json({
      success: true,
      data: accommodation,
      links: [
        {
          rel: "modify",
          href: `/accommodations/${accommodation.id}`,
          method: "PUT",
        },
        {
          rel: "delete",
          href: `/accommodations/${accommodation.id}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

/*-------------------------------------------------------------------------------*/
/*                                 /myAccommodations/                            */
/*-------------------------------------------------------------------------------*/

exports.findAllMyAccommodations = async (req, res, next) => {
  try {
    clear();
    const userId = req.loggedUserId;
    console.log(`UserId: ${userId}`);

    // Busca todas as acomodações criadas pelo utilizador autenticado
    let Accommodations = await Accommodation.findAndCountAll({
      where: { createdByUserId: userId },
      raw: true,
    });

    // Se não encontrar acomodações, lança erro 404
    if (!Accommodations || Accommodations.length === 0) {
      throw new ErrorHandler(404, "No accommodations found for this user.");
    }

    // formata a data para 'YYYY-MM-DD'
    const formatDate = (isoDate) => {
      if (!isoDate) return null;
      return new Date(isoDate).toISOString().split("T")[0];
    };

    // mapeia as acomodações e formata as datas
    const formattedData = Accommodations.rows.map((acc) => ({
      ...acc,
      available_from: formatDate(acc.available_from),
      available_to: formatDate(acc.available_to),
    }));

    // Retorna os dados das acomodações com links HATEOAS
    return res.status(200).json({
      success: true,
      data: formattedData,
      links: [
        {
          rel: "self",
          href: `/accommodations/myAccommodations`,
          method: "GET",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.createOneMyAccommodation = async (req, res, next) => {
  try {
    clear();

    let newAccommodation = await Accommodation.create({
      createdByUserId: req.loggedUserId,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      room_type: req.body.room_type,
      bed_count: req.body.bed_count,
      price_per_night: req.body.price_per_night,
      rating: null,
      available_from: req.body.available_from,
      available_to: req.body.available_to,
    });

    return res.status(200).json({
      success: true,
      data: newAccommodation,
      links: [
        {
          rel: "modify",
          href: `/accommodations/${newAccommodation.id}`,
          method: "PUT",
        },
        {
          rel: "delete",
          href: `/accommodations/${newAccommodation.id}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    next(err)
  }
};

exports.updateOneMyAccommodation = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const accommodationId = req.params.idAccommodation;

    const accommodation = await Accommodation.findByPk(accommodationId);

    if (!accommodation) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodation with ID ${accommodationId}.`
      );
    }

    if (accommodation.createdByUserId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this accommodation.`
      );
    }

    accommodation.title = req.body.title || accommodation.title;
    accommodation.description = req.body.description || accommodation.description;
    accommodation.location = req.body.location || accommodation.location;
    accommodation.room_type = req.body.room_type || accommodation.room_type;
    accommodation.bed_count = req.body.bed_count || accommodation.bed_count;
    accommodation.price_per_night = req.body.price_per_night || accommodation.price_per_night;
    accommodation.available_from = req.body.startDate || accommodation.available_from;
    accommodation.available_to = req.body.endDate || accommodation.available_to;

    await accommodation.save();

    return res.status(200).json({
      success: true,
      data: `Accommodation with ID ${accommodationId} updated successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOneMyAccommodation = async (req, res, next) => {
  try {
    clear();
    const accommodationId = req.params.idAccommodation;
    //console.log(`AccommodationId: ${accommodationId}`);

    // Busca a acomodação por chave primária
    const accommodation = await Accommodation.findByPk(accommodationId);

    //Obter user logado para garantir que o utilizador autenticado é o dono da acomodação
    const loggedUserId = req.loggedUserId;
    //console.log(`Logged UserId: ${loggedUserId}`);

    // Se não encontrar a acomodação, lança erro 404
    if (!accommodation) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodation with ID ${accommodationId}.`
      );
    }

    if (accommodation.createdByUserId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to delete this accommodation.`
      );
    }

    accommodation.destroy();

    return res.status(200).json({
      success: true,
      data: `Accommodation with ID ${accommodationId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/*---------------------------------------------------------------------*/
/*                          accommodationRating                        */
/*---------------------------------------------------------------------*/

exports.findAllAccommodationRatings = async (req, res, next) => {
  try {
    clear();
    const userId = req.loggedUserId;
    const accommodationId = req.params.idAccommodation;

    // Busca todas as acomodações criadas pelo utilizador autenticado
    let AccommodationRatings = await AccommodationRating.findAndCountAll({
      where: {
        userId: userId,
        accommodationId: accommodationId
      },
      raw: true,
    });

    // Se não encontrar acomodações, lança erro 404
    if (!AccommodationRatings || AccommodationRatings.length === 0) {
      throw new ErrorHandler(404, "No accommodationRating found for this user.");
    }

    // Retorna os dados das acomodações com links HATEOAS
    return res.status(200).json({
      success: true,
      data: AccommodationRatings,
    });
  } catch (err) {
    next(err);
  }
};

exports.createOneAccommodationRating = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const accommodationId = req.params.idAccommodation;
    const accommodationRating = await AccommodationRating.findByPk(accommodationId);

    if (accommodationRating) {
      throw new ErrorHandler(
        400,
        "You have already rated this accommodation."
      );
    }

    let newAccommodationRating = await AccommodationRating.create({
      userId: loggedUserId,
      accommodationId: accommodationId,
      rating: req.body.rating,
      commentary:req.body.coommentary
    });

    return res.status(200).json({
      success: true,
      data: newAccommodationRating,
    });
  } catch (err) {
    next(err)
  }
};

exports.updateOneAccommodationRating = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const accommodationRatingId = req.params.idAccommodation;
    const accommodationRating = await AccommodationRating.findByPk(accommodationRatingId);

    if (!accommodationRating) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodationRating with ID ${accommodationRatingId}.`
      );
    }

    if (accommodationRating.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this accommodationRating.`
      );
    }

    accommodationRating.rating = req.body.rating || accommodationRating.rating;
    accommodationRating.commentary = req.body.commentary || accommodationRating.commentary

    await accommodationRating.save();

    return res.status(200).json({
      success: true,
      data: `AccommodationRating with ID ${accommodationRatingId} updated successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOneAccommodationRating = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;
    const accommodationRatingId = req.params.idAccommodation;

    const accommodationRating = await AccommodationRating.findByPk(accommodationRatingId);

    if (!accommodationRating) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodationRating with ID ${accommodationRatingId}.`
      );
    }

    if (accommodationRating.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this accommodationRating.`
      );
    }

    await accommodationRating.destroy();

    return res.status(200).json({
      success: true,
      data: `AccommodationRating with ID ${accommodationRatingId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};