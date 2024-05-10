import bcrypt from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import z from "zod";
import { db } from "../infra/db";

//Cadastrar administrador
export async function createAdmin(req: FastifyRequest, reply: FastifyReply) {
  // criando schema de validação com ZOD
  const createAdminSchema = z.object({
    email: z.string().email().max(256),
    password: z.string().min(6).max(32),
    name: z.string().max(180).optional(),
  });

  try {
    const { password, email, name } = createAdminSchema.parse(req.body);
    if (!email) {
      return reply
        .code(400)
        .send({ message: "É necessário informar o email de administrador!" });
    }
    // Verificando se admin já existe
    const adminAlreadyExists = await db.customer.findUnique({
      where: {
        email,
      },
    });
    // exibir mensagem de erro, caso já exista o admin no banco de dados
    if (adminAlreadyExists) {
      return reply.code(401).send({
        message: "Administrador já existe!",
      });
    }
    // criptografando senha do admin
    const saltRound = 8;
    const hashPassword = await bcrypt.hash(password, saltRound);
    // Gerando UUID do admin
    const adminUUID = crypto.randomUUID();
    // cadastrando admin no banco de dados
    const createdAdmin = await db.admin.create({
      data: {
        adminId: adminUUID,
        password: hashPassword,
        email,
        name: name!,
      },
    });
    return reply.code(201).send(createdAdmin);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
