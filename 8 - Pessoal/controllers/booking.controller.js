const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const AccommodationBooking = db.accommodationBooking;
const EventBooking = db.eventBooking;
const Accommodation = db.accommodation;
const Event = db.event;


//necessary for LIKE operator
const { Op, ValidationError, and } = require("sequelize");
const clear = require("clear");

exports.create = async (req, res) => {
  try {
    clear();
    let novaReserva = {};
    const userId = req.loggedUserId;
    const accommodationId = req.params.idAccommodation ? parseInt(req.params.idAccommodation) : null;
    const eventId = req.params.idEvent ? parseInt(req.params.idEvent) : null;

    //console.log(userId, accommodationId, eventId);

    const { 
      from, 
      to, 
      numPeople 
    } = req.body;

    // Se for reserva de alojamento, validar campos obrigatórios
    if (accommodationId && accommodationId != 0) {
      if (accommodationId) {
        if (!from || !to || !numPeople) {
          return res.status(400).json({
            errorMessage:
              "Campos obrigatórios em falta para reserva de alojamento: DataInicio, DataFim, NumPessoas.",
          });
        }

        const alojamento = await Accommodation.findByPk(accommodationId); //console.log(alojamento);
        if (!alojamento) {
          return res
            .status(404)
            .json({ errorMessage: "Alojamento não encontrado." });
        }; 

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
      }

      // Criar reserva ou inscrição
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

    // Se for inscrição em evento
    if (eventId && eventId != 0) {
      if (eventId) {
        const evento = await Event.findByPk(eventId);
        if (!evento) {
          return res
            .status(404)
            .json({ errorMessage: "Evento não encontrado." });
        }

        const existingBooking = await EventBooking.findOne({
          where: {
            userId,
            eventId,
            estado: "inscrito",
          },
        });

        if (existingBooking) {
          return res.status(409).json({
            success: false,
            message:
              "Já existe uma inscrição pendente para este usuário neste evento.",
          });
        }
      }
      // Criar reserva ou inscrição
      novaReserva = await EventBooking.create({
        userId,
        eventId,
        estado: "inscrito",
      });
    }

    return res.status(201).json({
      success: true,
      message: accommodationId ? "Reserva de alojamento criada com sucesso." : "Inscrição em evento criada com sucesso.",
      dados: novaReserva,
    });
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return res.status(500).json({
      errorMessage: "Erro interno ao criar reserva.",
      error: error.message,
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    clear();
    const userId = req.loggedUserId; 
    //console.log("UserId:", userId);

    let accommodationId = req.params.idAccommodation;
    //console.log("AccommodationId:", accommodationId);

    let accommodation = await Accommodation.findByPk(accommodationId); 
    //console.log("Accommodation:", accommodation);

    let accommodationBookings = await AccommodationBooking.findAndCountAll({
      where: {
        accommodationId: accommodationId,
      },
      order: [["from", "DESC"]],
    }); //console.log("AccommodationBookings:", accommodationBookings);

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully.",
      dados: accommodationBookings.rows,
    });
    
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return res.status(500).json({
      errorMessage: "Erro interno ao buscar reservas.",
      error: error.message,
    });
  }
};

exports.validateAccommodationBooking = async (req, res, next) => {
  try {
    clear();
    const loggedUserId = req.loggedUserId; 
    //console.log("LoggedUserId:", loggedUserId);
    const accommodationId = req.params.idAccommodation; 
    //console.log("accommodationId:", accommodationId);
    const accommodationBookingId = req.params.idAccommodationBooking; 
    //console.log("accommodationBookingId:", accommodationBookingId);

    // Busca o alojamento associado à reserva
    const accommodation = await Accommodation.findByPk(accommodationId); 
    //console.log("Accommodation:", accommodation);
    
    // Verifica se o utilizador autenticado é o dono do alojamento
    if (accommodation.createdByUserId !== loggedUserId) {
      throw new ErrorHandler(403, `You are not allowed to validate this booking.`);
    }

    if (!accommodation) {
      throw new ErrorHandler(404, `Accommodation not found for this booking.`);
    }

    // Busca a reserva
    const accommodationBooking = await AccommodationBooking.findByPk(accommodationBookingId); 
    console.log("AccommodationBooking:", accommodationBooking);

    if (!accommodationBooking) {
      throw new ErrorHandler(404, `No booking found with ID ${accommodationBookingId}.`);
    }

    accommodationBooking.status = req.body.status || accommodationBooking.status;
    accommodationBooking.commentary = req.body.commentary || accommodationBooking.commentary
    accommodationBooking.from = accommodationBooking.from
    accommodationBooking.to = accommodationBooking.to

    console.log("Updated Booking:", accommodationBooking);

    return res.status(200).json({
      success: true,
      message: "Booking validated successfully.",
      // dados: ..., 
    });

  } catch (error) {
    console.error("Error validating booking:", error);
    next(error); // encaminha para middleware de erro central
  }
};
