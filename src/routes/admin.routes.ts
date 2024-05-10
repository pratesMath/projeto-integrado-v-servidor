import { FastifyInstance } from "fastify";
import { createAdmin } from "../controllers/admin.controller";

export async function adminRoutes(route: FastifyInstance) {
  // para cadastro de administrador
  route.post("/cadastro", createAdmin);
}
