import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../../../../src/interfaces/middleware/errorHandler';

describe('errorHandler middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle AppError with custom status code', () => {
    const err = new AppError('Not Found', 404);

    errorHandler(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Not Found',
        stack: expect.any(String),
      })
    );
  });

  it('should handle generic Error with status 500', () => {
    const err = new Error('Unexpected Error');

    errorHandler(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Unexpected Error',
        stack: expect.any(String),
      })
    );
  });

  it('should exclude stack trace in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Prod Error');

    errorHandler(err, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Prod Error',
    });

    // Clean up
    process.env.NODE_ENV = 'test';
  });
});
