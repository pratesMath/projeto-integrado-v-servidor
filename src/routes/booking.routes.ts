import { FastifyInstance } from "fastify";
import {
  createBooking,
  getAllBookings,
  getBookingById,
} from "../controllers/booking.controller";

export async function bookingRoutes(route: FastifyInstance) {
  // para admin cadastrar um hotel
  route.post("/cadastro", createBooking);
  // para cliente acessar todas hotéis disponíveis para reserva
  route.get("/todas", getAllBookings);
  // para cliente acessar hotel específico
  route.get("/:bookingId", getBookingById);
}
