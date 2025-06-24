import { AppError } from "../../../interfaces/middleware/errorHandler";

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}
