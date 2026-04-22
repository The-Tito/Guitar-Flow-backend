import bcrypt from "bcryptjs";
import { UserRepository } from "../../domain/repositories/user-repository";
import { AppError } from "../../shared/errors/app-error";
import { signToken } from "../../shared/utils/jwt";

export class RegisterUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: {
    full_name: string;
    email: string;
    password: string;
  }): Promise<string> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new AppError("El email ya está registrado", 409);

    const password_hash = await bcrypt.hash(input.password, 12);
    const userId = await this.userRepo.create({
      full_name: input.full_name,
      email: input.email,
      password_hash,
    });

    return signToken(userId);
  }
}
