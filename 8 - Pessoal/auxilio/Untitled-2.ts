exports.update = async (req, res, next) => {
  try {
    clear();

    const accommodationBookingId = req.params.idAccommodationBooking;
    const loggedUserId = req.loggedUserId;

    // Busca a reserva por chave primária
    const accommodationBooking = await AccommodationBooking.findByPk(accommodationBookingId);

    if (!accommodationBooking) {
      throw new ErrorHandler(
        404,
        `Cannot find any accommodationBooking with ID ${accommodationBookingId}.`
      );
    }

    // Verifica se a reserva pertence ao utilizador autenticado
    if (accommodationBooking.userId !== loggedUserId) {
      throw new ErrorHandler(
        403,
        `You are not allowed to update this accommodationBooking.`
      );
    }

    // Atualiza os campos da reserva
    accommodationBooking.from = from;
    accommodationBooking.to = to;
    accommodationBooking.numPeople = req.body.numPeople || accommodationBooking.numPeople;

    // Resetar estado para "pendente" após alteração
    accommodationBooking.status = "pendente";
    accommodationBooking.commentary = "";

    // Salva as alterações no banco de dados
    await accommodationBooking.save();

    return res.status(200).json({
      success: true,
      message: `AccommodationBooking with ID ${accommodationBookingId} updated successfully.`,
      data: accommodationBooking,
      links: [
        {
          rel: "self",
          href: `/users/me/bookings/${accommodationBookingId}`,
          method: "GET",
        },
        {
          rel: "cancel",
          href: `/users/me/bookings/${accommodationBookingId}`,
          method: "DELETE",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};
