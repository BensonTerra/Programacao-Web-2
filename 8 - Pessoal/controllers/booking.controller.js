const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWTconfig } = require("../utils/config.js");
const { ErrorHandler } = require("../utils/error.js");

const db = require("../models/index.js");
const AccommodationBooking = db.accommodationBooking;
const EventBooking = db.eventBooking;
const Accommodation = db.accommodation;
const Event = db.event;
const novaReserva = {};

//necessary for LIKE operator
const { Op, ValidationError, and } = require("sequelize");
const clear = require("clear");

exports.create = async (req, res) => {
  try {
    clear();
    const userId = req.loggedUserId;
    const accommodationId = req.params.idAccommodation ? parseInt(req.params.idAccommodation) : null;
    const eventId = req.params.idEvent ? parseInt(req.params.idEvent) : null;

    console.log(userId, accommodationId, eventId);

    const { DataInicio, DataFim, NumPessoas } = req.body;

    // Se for reserva de alojamento, validar campos obrigatórios
    if (accommodationId && accommodationId != 0) {
      if (accommodationId) {
        if (!DataInicio || !DataFim || !NumPessoas) {
          return res.status(400).json({
            errorMessage:
              "Campos obrigatórios em falta para reserva de alojamento: DataInicio, DataFim, NumPessoas.",
          });
        }

        const alojamento = await Accommodation.findByPk(accommodationId); console.log(alojamento);
        if (!alojamento) {
          return res
            .status(404)
            .json({ errorMessage: "Alojamento não encontrado." });
        }; 

        const existingBooking = await AccommodationBooking.findOne({
          where: {
            userId,
            accommodationId,
            estado: "pendente",
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
        data_inicio: DataInicio,
        data_fim: DataFim,
        num_pessoas: NumPessoas,
        estado: "pendente",
        comentario: null,
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
