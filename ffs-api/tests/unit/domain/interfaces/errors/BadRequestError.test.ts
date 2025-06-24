import { BadRequestError } from "../../../../../src/domain/core/errors/BadRequestError";
import { AppError } from "../../../../../src/interfaces/middleware/errorHandler";

describe('BadRequestError', () => {
  it('should create an instance of AppError with status 400', () => {
    const error = new BadRequestError('Invalid input');

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.stack).toBeDefined();
  });

  it('should have a name of BadRequestError', () => {
    const error = new BadRequestError('Some message');

    expect(error.name).toBe('BadRequestError');
  });
});
