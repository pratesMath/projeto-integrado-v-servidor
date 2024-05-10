import { FastifyInstance } from "fastify";
import {
  createCustomer,
  getCustomers,
  login,
  logout,
} from "../controllers/customer.controller";

export async function customerRoutes(route: FastifyInstance) {
  // para cadastro de clientes
  route.post("/cadastro", createCustomer);
  // para login do cliente
  route.post("/login", login);
  // para retornar todos os clientes
  route.get("/todos", { preHandler: [route.authenticate] }, getCustomers);
  // para logout de um cliente
  route.delete("/logout", { preHandler: [route.authenticate] }, logout);
}
