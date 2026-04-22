import { Pool, PoolClient } from "pg";
import { DbSession, QueryResult, SessionManager } from "../../domain/repositories/db-session";

class PgDbSession implements DbSession {
  constructor(private readonly client: PoolClient) {}

  async query<T extends Record<string, any>>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const result = await this.client.query<T>(sql, params);
    return { rows: result.rows };
  }
}

export class PgSessionManager implements SessionManager {
  constructor(private readonly pool: Pool) {}

  async withUserSession<T>(userId: number, work: (session: DbSession) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL app.current_user_id = $1", [String(userId)]);

      const session = new PgDbSession(client);
      const result = await work(session);

      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
