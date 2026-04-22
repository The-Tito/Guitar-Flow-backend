export interface QueryResult<T> {
  rows: T[];
}

export interface DbSession {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface SessionManager {
  withUserSession<T>(userId: number, work: (session: DbSession) => Promise<T>): Promise<T>;
}
