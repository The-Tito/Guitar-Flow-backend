import { Pool } from "pg";
import { env } from "../../shared/config/env";

export const pgPool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.APP_DB_USER,
  password: env.APP_DB_PASSWORD,
  database: env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});
