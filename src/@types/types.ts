import { JWT } from "@fastify/jwt";

// Adicionando um novo "tipo" de interface a ser reconhecido pelo servidor
// Usado na autenticação do usuário, em rotas do servidor que precisam de autenticação
declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}
type CustomerPayload = {
  customerId: string;
  email: string;
  name: string;
};
declare module "@fastify/jwt" {
  interface AppJWT {
    customer: CustomerPayload;
  }
}
