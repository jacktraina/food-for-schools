import { AppError } from "../../../interfaces/middleware/errorHandler";

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}
