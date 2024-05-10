import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import z from "zod";
import { db } from "../infra/db";

//Cadastrar reserva disponível
export async function createBooking(req: FastifyRequest, reply: FastifyReply) {
  // criando schema de validação com ZOD
  const createBookingSchema = z.object({
    adminId: z.string(),
    bookingName: z.string(),
    address: z.string(),
    availableRoomsArr: z.string().array(),
    imageUrlArr: z.string().array(),
  });

  try {
    const { adminId, bookingName, address, availableRoomsArr, imageUrlArr } =
      createBookingSchema.parse(req.body);
    // retornando mensagem de erro caso admin não informe algum dos campos abaixo
    if (!bookingName) {
      return reply.code(400).send({ message: "Informe o nome do hotel!" });
    }
    if (!address) {
      return reply.code(400).send({ message: "Informe o endereço do hotel!" });
    }
    if (!adminId) {
      return reply.code(400).send({ message: "Informe o administrador!" });
    }
    // Verificando se admin já existe no banco de dados
    const adminAlreadyExists = await db.admin.findFirst({
      where: {
        adminId,
      },
    });
    // retornando erro caso o admin não esteja no banco de dados
    if (!adminAlreadyExists) {
      return reply.code(401).send({
        message: "Este não é um administrador válido!",
      });
    }

    // Verificando se o hotel já existe
    const bookingAlreadyExists = await db.booking.findUnique({
      where: {
        bookingName,
      },
    });
    // exibir mensagem de erro, caso já exista o hotel no banco de dados
    if (bookingAlreadyExists) {
      return reply.code(401).send({
        message: "Este Hotel já está cadastrado em nosso sistema!",
      });
    }
    // Gerando UUID
    const bookingUUID = crypto.randomUUID();
    // Cadastrando hotel para reserva
    const createdBooking = await db.booking.create({
      data: {
        bookingId: bookingUUID,
        adminId,
        bookingName,
        address,
        availableRoomsArr,
        imageUrlArr,
      },
    });
    return reply.code(201).send(createdBooking);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
//Obter todas as reservas disponíveis
export async function getAllBookings(req: FastifyRequest, reply: FastifyReply) {
  try {
    const allBookings = await db.booking.findMany();

    return reply.code(200).send(allBookings);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
//Obter reserva disponível pelo id
export async function getBookingById(req: FastifyRequest, reply: FastifyReply) {
  const getBookingByIdSchema = z.object({
    bookingId: z.string(),
  });

  try {
    const { bookingId } = getBookingByIdSchema.parse(req.params);

    const booking = await db.booking.findFirst({
      select: {
        bookingId: true,
        bookingName: true,
        address: true,
        imageUrlArr: true,
        availableRoomsArr: true,
      },
      where: {
        bookingId,
      },
    });
    // retornando erro, caso não haja a reserva especifica
    if (!booking) {
      return reply.code(404).send("Reserva não encontrada!");
    }

    return reply.code(200).send(booking);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
