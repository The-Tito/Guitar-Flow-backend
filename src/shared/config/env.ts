import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  APP_DB_USER: z.string().min(1),
  APP_DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  APP_CURRENT_USER_ID: z.coerce.number().int().positive(),
  DB_HOST: z.string().optional().default("localhost"),
  APP_PORT: z.coerce.number().int().positive().optional().default(3000)
});

export const env = envSchema.parse(process.env);
