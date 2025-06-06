const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const Accommodation = db.accommodation;
const accommodationBooking = db.accommodationBooking;
const User = db.user;

//necessary for LIKE operator
const { Op, ValidationError } = require("sequelize");
const clear = require("clear");

exports.findAll = async (req, res, next) => {
  clear();
  //get data from request query string (if not existing, they will be undefined)
  let {
    creatorName,
    title,
    location,
    room_type,
    bed_count,
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
        username: { [Op.like]: `%${creatorName}%` }, // ou [Op.like] dependendo do banco
      },
      attributes: [], // não retorna os dados do user, apenas usa para filtro
    });
  } //console.log(JSON.stringify(include, null, 2));

  // search by title require to build a query with the operator L
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
    const overlappingBookings = await accommodationBooking.findAll({
      attributes: ["accommodationId"],
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
    let Accomodations = await Accommodation.findAndCountAll({
      where: condition,
      include,
      limit,
      offset,
      raw: true,
    });

    /* map HATEOAS links to each one of the Accomodations
    Accomodations.rows.forEach(Accomodation => {
      Accomodation.links = [
        { rel: "self", href: `/Accomodations/${Accomodation.id}`, method: "GET" },
        { rel: "modify", href: `/Accomodations/${Accomodation.id}`, method: "PUT" },
        { rel: "delete", href: `/Accomodations/${Accomodation.id}`, method: "DELETE" },
      ]
    });
    */

    // formata a data para 'YYYY-MM-DD'
    const formatDate = (isoDate) => {
      if (!isoDate) return null;
      return new Date(isoDate).toISOString().split('T')[0];
    }

    // mapeia as acomodações e formata as datas
    const formattedData = Accomodations.rows.map(acc => ({
      ...acc,
      available_from: formatDate(acc.available_from),
      available_to: formatDate(acc.available_to),
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      links: [
        {
          rel: "GET All_Accommodations",
          href: `/accommodations`,
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
    const accommodationId = req.params.idAccommodation;
    console.log(`AccomodationId: ${accommodationId}`);

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
      throw new ErrorHandler(
        404,
        `Cannot find any accommodation with ID ${accommodationId}.`
      );
    }

    // Retorna os dados do utilizador com links HATEOAS
    return res.json({
      success: true,
      data: accommodation,
      links: [
        {
          rel: "modify",
          href: `/Accomodations/${accommodation.id}`,
          method: "PUT",
        },
        {
          rel: "delete",
          href: `/Accomodations/${accommodation.id}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};

exports.findAllMyAccommodations = async (req, res, next) => {
  try {
    clear();
    const userId = req.loggedUserId; //console.log(`UserId: ${userId}`);
    
    // Busca todas as acomodações criadas pelo utilizador autenticado
    let Accommodations = await Accommodation.findAndCountAll({
      where: { createdByUserId: userId },
      raw: true,
    }); //console.log(`Accommodations: ${Accommodations}`);
    
    // Se não encontrar acomodações, lança erro 404
    if (!Accommodations || Accommodations.length === 0) {
      throw new ErrorHandler(404, "No accommodations found for this user.");
    }

    // formata a data para 'YYYY-MM-DD'
    const formatDate = (isoDate) => {
      if (!isoDate) return null;
      return new Date(isoDate).toISOString().split('T')[0];
    }

    // mapeia as acomodações e formata as datas
    const formattedData = Accommodations.rows.map(acc => ({
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
          rel: "GET My_Accommodations",
          href: `/accommodations/my`,
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

    let newAccommodation = await Accommodation.create({
      createdByUserId: req.loggedUserId,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      room_type: req.body.room_type,
      bed_count: req.body.bed_count,
      price_per_night: req.body.price_per_night,
      rating: null,
      available_from: req.body.startDate,
      available_to: req.body.endDate,
    });

    return res.json({
      success: true,
      data: newAccommodation,
      links: [
        {
          rel: "modify",
          href: `/accomodations/${newAccommodation.id}`,
          method: "PUT",
        },
        {
          rel: "delete",
          href: `/accomodations/${newAccommodation.id}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    console.error("Erro ao criar accommodation:", err);
    return res.status(400).json({
      success: false,
      msg: err.message,
      errors: err.errors ? err.errors.map((e) => e.message) : null,
    });
  }
};

/*patch*/


/*delete*/
