import { Pool } from "pg";
import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/user-repository";

export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query<User>(
      "SELECT id, full_name, email, password_hash FROM Users WHERE email = $1",
      [email]
    );
    return rows[0] ?? null;
  }

  async create(data: Pick<User, "full_name" | "email" | "password_hash">): Promise<number> {
    const { rows } = await this.pool.query<{ id: number }>(
      "INSERT INTO Users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [data.full_name, data.email, data.password_hash]
    );
    return rows[0].id;
  }
}
