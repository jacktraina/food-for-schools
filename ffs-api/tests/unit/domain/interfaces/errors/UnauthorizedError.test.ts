import { UnauthorizedError } from "../../../../../src/domain/core/errors/UnauthorizedError";
import { AppError } from "../../../../../src/interfaces/middleware/errorHandler";

describe('UnauthorizedError', () => {
  it('should extend AppError with status 401', () => {
    const error = new UnauthorizedError('Custom unauthorized message');

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Custom unauthorized message');
    expect(error.stack).toBeDefined();
  });

  it('should default to "Unauthorized" if no message is provided', () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe('Unauthorized');
    expect(error.statusCode).toBe(401);
  });

  it('should have the name "UnauthorizedError"', () => {
    const error = new UnauthorizedError();

    expect(error.name).toBe('UnauthorizedError');
  });
});
