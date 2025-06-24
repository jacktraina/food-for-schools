import { NotFoundError } from "../../../../../src/domain/core/errors/NotFoundError";
import { AppError } from "../../../../../src/interfaces/middleware/errorHandler";

describe('NotFoundError', () => {
  it('should extend AppError with status 404', () => {
    const error = new NotFoundError('User');

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
    expect(error.stack).toBeDefined();
  });

  it('should use default message when no resource is provided', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('Resource not found');
  });

  it('should have name "NotFoundError"', () => {
    const error = new NotFoundError('Item');

    expect(error.name).toBe('NotFoundError');
  });
});
