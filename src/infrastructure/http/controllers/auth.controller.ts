import { Request, Response } from "express";
import { z } from "zod";
import { LoginUseCase } from "../../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../../application/use-cases/register.use-case";

const registerSchema = z.object({
  full_name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { full_name, email, password } = registerSchema.parse(req.body);
      const token = await this.registerUseCase.execute({
        full_name,
        email,
        password,
      });
      res.status(201).json({ token });
    } catch (error: any) {
      console.error("❌ Error en Register:", error);

      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Validation error", issues: error.issues });
        return;
      }

      // Esto nos dirá el error real en el CURL
      res.status(500).json({
        message: "Internal server error",
        debug: error.message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const token = await this.loginUseCase.execute({ email, password });
      res.json({ token });
    } catch (error: any) {
      console.error("❌ Error en Login:", error);

      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Validation error", issues: error.issues });
        return;
      }

      res.status(500).json({
        message: "Internal server error",
        debug: error.message,
      });
    }
  }
}
