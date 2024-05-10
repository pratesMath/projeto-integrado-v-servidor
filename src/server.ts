import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyJwt, { AppJWT } from "@fastify/jwt";
import dotenv from "dotenv";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { env } from "./env";
import { adminRoutes } from "./routes/admin.routes";
import { bookingRoutes } from "./routes/booking.routes";
import { customerRoutes } from "./routes/customer.routes";
import { customerReservationsRoutes } from "./routes/customerReservation.routes";

dotenv.config();
const server = fastify();

server.register(fastifyJwt, { secret: env.JWT_SECRET });
server.register(cors);

server.addHook("preHandler", (req, reply, next) => {
  req.jwt = server.jwt;
  return next();
});
server.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.accessToken;
    console.log(token);
    if (!token) {
      return reply.status(401).send({ message: "Authentication required" });
    }
    const decoded = req.jwt.verify<AppJWT["customer"]>(token);
    req.user = decoded;
  }
);
server.register(cookie, {
  secret: "projeto-integrado-v-2024",
  hook: "preHandler",
});
// registrando rotas de clientes
server.register(customerRoutes, { prefix: "customers" });
// registrando rotas de admin
server.register(adminRoutes, { prefix: "admins" });
// registrando rotas de reservas
server.register(bookingRoutes, { prefix: "bookings" });
// registrando rotas de reservas do cliente
server.register(customerReservationsRoutes, {
  prefix: "customer_reservations",
});

// inicializando e executando o servidor na função main
async function main() {
  await server
    .listen({
      port: env.SERVER_PORT ?? 8967,
      host: env.SERVER_HOST ?? "0.0.0.0",
    })
    .then(() => {
      console.log(`🚀 O servidor está rodando`);
      console.log(env.DATABASE_URL);
    });
}
main();
