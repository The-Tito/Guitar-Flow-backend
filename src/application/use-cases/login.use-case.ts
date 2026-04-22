import bcrypt from "bcryptjs";
import { UserRepository } from "../../domain/repositories/user-repository";
import { AppError } from "../../shared/errors/app-error";
import { signToken } from "../../shared/utils/jwt";

export class LoginUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: { email: string; password: string }): Promise<string> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) throw new AppError("Credenciales inválidas", 401);

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) throw new AppError("Credenciales inválidas", 401);

    return signToken(user.id);
  }
}
