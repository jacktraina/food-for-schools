import { AppError } from "../../../interfaces/middleware/errorHandler";

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}