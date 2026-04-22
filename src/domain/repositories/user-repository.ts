import { User } from "../entities/user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: Pick<User, "full_name" | "email" | "password_hash">): Promise<number>;
}
