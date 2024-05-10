import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import z from "zod";
import { db } from "../infra/db";

//Cadastrar reservas do cliente
export async function createCustomerReservation(
  req: FastifyRequest,
  reply: FastifyReply
) {
  // criando schemas de validação com ZOD
  const createCustomerReservationSchema = z.object({
    bookingId: z.string(),
    customerId: z.string(),
    customerSelectedRooms: z.string().array(),
    startDate: z.string(),
    endDate: z.string(),
  });
  try {
    const { bookingId, customerSelectedRooms, startDate, endDate, customerId } =
      createCustomerReservationSchema.parse(req.body);
    if (!startDate || !endDate) {
      return reply.code(400).send({
        message: "É necessário informar as datas de período da reserva!",
      });
    }
    if (!customerSelectedRooms) {
      return reply.code(400).send({
        message: "É necessário selecionar pelo menos um quarto!",
      });
    }
    const bookingRooms = await db.booking.findFirst({
      select: {
        availableRoomsArr: true,
      },
      where: {
        bookingId,
      },
    });
    if (
      !bookingRooms?.availableRoomsArr ||
      bookingRooms.availableRoomsArr.length === 0
    ) {
      return reply.code(400).send({
        message: "Infelizmente, não há quartos disponíveis neste hotel!",
      });
    }
    // Atualizando os quartos que antes estavam disponíveis para reserva
    // mas que foram selecionados pelo cliente
    // Esses quartos não estarão mais disponíveis, apenas para quem os reservou
    const updatedRooms = bookingRooms.availableRoomsArr.filter(
      (room) => !customerSelectedRooms.includes(room)
    );
    // Tratando do caso onde nem todos os quartos selecionados estão disponíveis
    const currentAvailableRoomsArr = bookingRooms.availableRoomsArr;
    if (customerSelectedRooms.length > currentAvailableRoomsArr.length) {
      const availableRoomsNow = currentAvailableRoomsArr.filter((room) =>
        updatedRooms.includes(room)
      );
      const formattedUnavailableRooms = availableRoomsNow.join(", ");
      const message = `Apenas os quartos [${formattedUnavailableRooms}] estão disponíveis no momento!`;

      return reply.code(400).send({ message });
    }
    // Gerando UUID e cadastrando no banco de dados
    const customerReservationUUID = crypto.randomUUID();
    const createdCustomerReservation = await db.customerReservation.create({
      data: {
        customerReservationId: customerReservationUUID,
        bookingId,
        customerId,
        selectedRoomsArr: customerSelectedRooms,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      },
    });
    // Atualizar as reservas com os quartos disponíveis que não foram selecionados
    await db.booking.update({
      data: {
        availableRoomsArr: updatedRooms,
      },
      where: {
        bookingId,
      },
    });
    return reply.code(201).send({
      createdCustomerReservation,
      message: "Sua reserva foi cadastrada com êxito!",
    });
  } catch (error) {
    return reply.code(500).send(error);
  }
}
//Obter reservas do cliente
export async function getAllCustomerReservations(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const getCustomerReservationSchema = z.object({
    customerId: z.string(),
  });

  try {
    const { customerId } = getCustomerReservationSchema.parse(req.params);

    const customersReservations = await db.customerReservation.findMany({
      select: {
        customerId: true,
        customerReservationId: true,
        startDate: true,
        endDate: true,
        booking: {
          select: {
            address: true,
            bookingName: true,
            imageUrlArr: true,
          },
        },
      },
      where: {
        customerId,
      },
    });

    return reply.code(200).send(customersReservations);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
//Obter reservas do cliente pelo id
export async function getCustomerReservationById(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const getCustomerReservationByIdSchema = z.object({
    customerReservationId: z.string(),
  });

  try {
    const { customerReservationId } = getCustomerReservationByIdSchema.parse(
      req.params
    );

    const customerReservation = await db.customerReservation.findFirst({
      select: {
        customerReservationId: true,
        startDate: true,
        endDate: true,
        selectedRoomsArr: true,
        booking: {
          select: {
            address: true,
            bookingName: true,
            imageUrlArr: true,
          },
        },
      },
      where: {
        customerReservationId,
      },
    });

    if (!customerReservation) {
      return reply.code(404).send("A sua reserva não foi encontrada!");
    }

    return reply.code(200).send(customerReservation);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
// Cancelar reservas do cliente
export async function cancelCustomerReservation(
  req: FastifyRequest,
  reply: FastifyReply
) {
  // criando schemas de validação com ZOD
  const cancelReservationSchema = z.object({
    customerReservationId: z.string(),
  });

  try {
    const { customerReservationId } = cancelReservationSchema.parse(req.params);

    const reservation = await db.customerReservation.findFirst({
      select: {
        selectedRoomsArr: true,
        bookingId: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
      where: { customerReservationId },
    });

    if (!reservation) {
      return reply.code(400).send({
        message: "Sua reserva não foi encontrada!",
      });
    }

    const bookingId = reservation.bookingId;
    const booking = await db.booking.findFirst({
      select: { availableRoomsArr: true },
      where: { bookingId },
    });
    if (!booking) {
      return reply.code(400).send({
        message: "Este hotel não está mais em nosso catálogo!",
      });
    }
    // Lógica para devolver os quartos selecionados pelo cliente para o hotel
    // concat é usado para fazer concatenação de arrays, gerando um novo array
    const updatedRooms = booking?.availableRoomsArr.concat(
      reservation.selectedRoomsArr
    );

    // deletar reserva (cancelar)
    await db.customerReservation.delete({
      where: {
        customerReservationId,
      },
    });

    // Atualizar as reservas com os quartos da reserva cancelada pelo cliente
    await db.booking.update({
      data: {
        availableRoomsArr: updatedRooms,
      },
      where: {
        bookingId,
      },
    });

    return reply.code(201).send({ message: "Sua reserva foi cancelada!" });
  } catch (error) {
    return reply.code(500).send(error);
  }
}
