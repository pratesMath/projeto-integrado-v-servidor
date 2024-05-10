import { FastifyInstance } from "fastify";
import {
  cancelCustomerReservation,
  createCustomerReservation,
  getAllCustomerReservations,
  getCustomerReservationById,
} from "../controllers/customerReservation.controller";

export async function customerReservationsRoutes(route: FastifyInstance) {
  // NOTA: Em todos os casos abaixo, o cliente deve estar logado
  // Observar as linhas com "{ preHandler: [route.authenticate] }"

  // para cliente cadastrar uma reserva
  route.post(
    "/cadastro",
    { preHandler: [route.authenticate] },
    createCustomerReservation
  );
  // para cliente acessar todas as suas reservas
  route.get(
    "/todas/:customerId",
    { preHandler: [route.authenticate] },
    getAllCustomerReservations
  );
  // para cliente acessar uma reserva específica
  route.get(
    "/:customerReservationId",
    {
      preHandler: [route.authenticate],
    },
    getCustomerReservationById
  );
  // para cliente cancelar uma reserva específica
  route.delete(
    "/cancelar/:customerReservationId",
    { preHandler: [route.authenticate] },
    cancelCustomerReservation
  );
}
