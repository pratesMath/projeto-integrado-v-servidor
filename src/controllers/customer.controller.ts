import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import z from "zod";
import { db } from "../infra/db";

//Obter clientes
export async function getCustomers(req: FastifyRequest, reply: FastifyReply) {
  try {
    const customers = await db.customer.findMany({
      select: {
        customerId: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!customers) {
      return reply.code(401).send({
        message: "Nenhum cliente encontrado",
      });
    }

    return reply.code(200).send(customers);
  } catch (error) {
    return reply.code(500).send(error);
  }
}
//Cadastrar cliente
export async function createCustomer(req: FastifyRequest, reply: FastifyReply) {
  // criando schema de validação com ZOD
  const createCustomerSchema = z.object({
    email: z.string().email().max(256),
    password: z.string().min(6).max(32),
    name: z.string().max(180).optional(),
  });

  try {
    const { email, name, password } = createCustomerSchema.parse(req.body);
    if (!email) {
      return reply
        .code(400)
        .send({ message: "É necessário informar o email do cliente!" });
    }
    // Verificando se cliente já existe pelo e-mail
    const customerAlreadyExists = await db.customer.findUnique({
      where: {
        email,
      },
    });
    // exibir mensagem de erro, caso exista o cliente no banco de dados
    if (customerAlreadyExists) {
      return reply.code(401).send({
        message: "Cliente já existe!",
      });
    }
    // criptografando a senha do cliente
    const saltRound = 8;
    const hashPassword = await bcrypt.hash(password, saltRound);
    // gerando UUID do cliente
    const customerUUID = crypto.randomUUID();
    // cadastrando cliente no banco de dados
    const createdCustomer = await db.customer.create({
      data: {
        customerId: customerUUID,
        password: hashPassword,
        email,
        name,
      },
    });
    return reply
      .code(201)
      .send({ createdCustomer, message: "Sua conta foi criada com êxito" });
  } catch (error) {
    return reply.code(500).send(error);
  }
}
// fazer login de cliente
export async function login(req: FastifyRequest, reply: FastifyReply) {
  // criando schema de validação com ZOD
  const loginCustomerSchema = z.object({
    email: z.string().email().max(256),
    password: z.string(),
  });

  try {
    const { email, password } = loginCustomerSchema.parse(req.body);
    // verificando existência do cliente pelo e-mail
    const customer = await db.customer.findUnique({
      where: { email: email },
    });
    // verificando senha com a senha no banco de dados
    const isMatch =
      customer && (await bcrypt.compare(password, customer.password));
    // retornando erro, caso a senha ou e-mail sejam inválidos
    if (!customer || !isMatch) {
      return reply.code(401).send({
        message: "E-mail ou Senha inválidos",
      });
    }
    const payload = {
      customerId: customer.customerId,
      email: customer.email,
      name: customer.name,
      password: customer.password,
    };
    // assinando token JWT com o payload acima
    const token = req.jwt.sign(payload);
    // o token deve expirar em 30 dias
    const expiresIn30Days = dayjs().add(30, "days").toDate();

    reply.setCookie("accessToken", token, {
      path: "/",
      expires: expiresIn30Days,
    });

    const message: string = "Login realizado com sucesso";

    return { accessToken: token, customerData: payload, message };
  } catch (error) {
    return reply.code(500).send(error);
  }
}
// Fazer logout de cliente
export async function logout(req: FastifyRequest, reply: FastifyReply) {
  try {
    reply.clearCookie("accessToken");
    return reply.send({ message: "Logout realizado com sucesso" });
  } catch (error) {
    return reply.code(500).send(error);
  }
}
