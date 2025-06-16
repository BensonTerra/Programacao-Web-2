const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const AccommodationBooking = db.accommodationBooking;
const EventBooking = db.eventBooking;
const Accommodation = db.accommodation;
const Event = db.event;

const { Op, ValidationError } = require("sequelize");
const clear = require("clear");


/*-------------------------------------------------------------------------------*/
/*                                 /myAccommodations/                            */
/*-------------------------------------------------------------------------------*/

exports.findAllAccommodationBookings = async (req, res) => {
  try {
    clear();

    const userId = req.loggedUserId;

    let accommodationId = req.params.idAccommodation;

    let accommodationBookings = await AccommodationBooking.findAndCountAll({
      where: {
        userId: userId,
        accommodationId: accommodationId,
      },
      order: [["from", "DESC"]],
    });

    if (!accommodationBookings || accommodationBookings.length === 0) {
      throw new ErrorHandler(404, "No accommodationBookings found for this user.");
    }

    return res.status(200).json({
      success: true,
      message: "AccommodationBookings retrieved successfully.",
      data: accommodationBookings.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return res.status(500).json({
      errorMessage: "Erro interno ao buscar reservas.",
      error: error.message,
    });
  }
};

exports.deleteOneMyAccommodationBooking = async (req, res, next) => {
  try {
    clear();

    const accommodationBookingId = req.params.idAccommodationBooking;

    const accommodationBooking = await AccommodationBooking.findByPk(accommodationBookingId);

    const loggedUserId = req.loggedUserId;

    if (!accommodationBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any AccommodationBooking with ID ${accommodationBookingId}.`
      );
    }

    if (accommodationBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to delete this eventBooking.`
      );
    }

    accommodationBooking.destroy();

    return res.status(200).json({
      success: true,
      data: `AccommoadationBooking with ID ${accommodationBookingId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

exports.findAllEventBookings = async (req, res) => {
  try {
    clear();

    const userId = req.loggedUserId;

    let eventId = req.params.idEvent;

    let eventBookings = await EventBooking.findAndCountAll({
      where: {
        userId: userId,
        eventId: eventId,
      },
      order: [["id", "DESC"]],
    });

    if (!eventBookings || eventBookings.length === 0) {
      throw new ErrorHandler(404, "No eventBookings found for this user.");
    }

    return res.status(200).json({
      success: true,
      message: "EventBooking retrieved successfully.",
      data: eventBookings.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOneMyEventBooking = async (req, res, next) => {
  try {
    clear();

    const eventId = req.params.idEvent;

    const eventBooking = await EventBooking.findByPk(eventId);

    const loggedUserId = req.loggedUserId;

    if (!eventBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any eventBooking with ID ${eventId}.`
      );
    }

    if (eventBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to delete this eventBooking.`
      );
    }

    eventBooking.destroy();

    return res.status(200).json({
      success: true,
      data: `EventBooking with ID ${eventId} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};



exports.createOneBooking = async (req, res) => {
  try {
    clear();
    let novaReserva = {};
    const userId = req.loggedUserId;
    const accommodationId = req.params.idAccommodation;
    const eventId = req.params.idEvent;

    const accommodation = await Accommodation.findByPk(accommodationId);
    const event = await Event.findByPk(eventId);
    
    const { from, to, numPeople } = req.body;

    if (accommodation) {
      if (accommodation && accommodationId) {
        if (!from || !to || !numPeople) {
          return res.status(400).json({
            errorMessage:
              "Campos obrigatórios em falta para reserva de alojamento: DataInicio, DataFim, NumPessoas.",
          });
        }

        const existingBooking = await AccommodationBooking.findOne({
          where: {
            userId,
            accommodationId,
            status: "pendente",
          },
        });

        if (existingBooking) {
          return res.status(409).json({
            success: false,
            message:
              "Já existe uma reserva pendente para este usuário neste alojamento.",
          });
        }
        
        novaReserva = await AccommodationBooking.create({
          userId,
          accommodationId,
          from: from,
          to: to,
          numPeople: numPeople,
          status: "pendente",
          commentary: null,
        });
      }
      else {
        return res
          .status(404)
          .json({ errorMessage: "Alojamento não encontrado." });
      }
    }


    if (event) {
      if (event && !accommodationId) {
        const existingBooking = await EventBooking.findOne({
          where: {
            userId,
            eventId,
            status: "inscrito",
          },
        });

        if (existingBooking) {
          return res.status(409).json({
            success: false,
            message:
              "Já possui uma inscrição para este evento.",
          });
        }
      
        novaReserva = await EventBooking.create({
          userId,
          eventId,
          estado: "inscrito",
        });
      }
      else {
        return res
          .status(404)
          .json({ errorMessage: "Evento não encontrado." });
      }
    }

    return res.status(201).json({
      success: true,
      message: accommodationId
        ? "Reserva de alojamento criada com sucesso."
        : "Inscrição em evento criada com sucesso.",
      data: novaReserva,
    });
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return res.status(500).json({
      errorMessage: "Erro interno ao criar reserva.",
      error: error.message,
    });
  }
};

exports.updateOneAccommodationBooking = async (req, res, next) => {
  try {
    clear();

    const loggedUserId = req.loggedUserId;

    const accommodationBookingId = req.params.idAccommodationBooking;

    const accommodationBooking = await AccommodationBooking.findByPk(
      accommodationBookingId
    );

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
    accommodationBooking.numPeople = req.body.numPeople || accommodationBooking.numPeople;
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



exports.validateAccommodationBooking = async (req, res, next) => {
  try {
    clear();
    const loggedUserId = req.loggedUserId;
    const accommodationId = req.params.idAccommodation;
    const accommodationBookingId = req.params.idAccommodationBooking;

    const accommodation = await Accommodation.findByPk(accommodationId);

    if (accommodation.createdByUserId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to validate this booking.`
      );
    }

    if (!accommodation) {
      throw new ErrorHandler(404, `Accommodation not found for this booking.`);
    }

    const accommodationBooking = await AccommodationBooking.findByPk(
      accommodationBookingId
    );

    if (!accommodationBooking) {
      throw new ErrorHandler(
        404,
        `No booking found with ID ${accommodationBookingId}.`
      );
    }

    accommodationBooking.status =
      req.body.status || accommodationBooking.status;
    accommodationBooking.commentary =
      req.body.commentary || accommodationBooking.commentary;
    accommodationBooking.from = accommodationBooking.from;
    accommodationBooking.to = accommodationBooking.to;


    return res.status(200).json({
      success: true,
      message: "Booking validated successfully.",
    });
  } catch (err) {
    next(err); 
  }
};
