import { AppError } from "../../../interfaces/middleware/errorHandler";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}