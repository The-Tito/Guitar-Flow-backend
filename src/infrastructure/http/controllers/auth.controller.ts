import { Request, Response } from "express";
import { z } from "zod";
import { LoginUseCase } from "../../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../../application/use-cases/register.use-case";

const registerSchema = z.object({
  full_name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida")
});

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const { full_name, email, password } = registerSchema.parse(req.body);
    const token = await this.registerUseCase.execute({ full_name: full_name!, email: email!, password: password! });
    res.status(201).json({ token });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = loginSchema.parse(req.body);
    const token = await this.loginUseCase.execute({ email: email!, password: password! });
    res.json({ token });
  }
}
