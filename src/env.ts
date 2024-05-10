import z from "zod";

const envSchema = z.object({
  SERVER_PORT: z.number(),
  SERVER_HOST: z.string(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
});

export const env = envSchema.parse({
  SERVER_PORT: Number(process.env.SERVER_PORT),
  SERVER_HOST: process.env.SERVER_HOST,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
});
