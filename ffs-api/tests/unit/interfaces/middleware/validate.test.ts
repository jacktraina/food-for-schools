import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateAll } from '../../../../src/interfaces/middleware/validate';
import { BadRequestError } from '../../../../src/domain/core/errors/BadRequestError';

describe('validate middleware', () => {
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

  it('should call next and set req.body if validation passes', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    req.body = { name: 'Alice', age: 30 };

    const middleware = validate(schema);
    middleware(req as Request, res as Response, next);

    expect(req.body).toEqual({ name: 'Alice', age: 30 });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 400 and send errors if validation fails', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    req.body = { name: 'Alice', age: 'not-a-number' };

    const middleware = validate(schema);
    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.any(Object), // You can be more specific if you want
    });
    expect(next).not.toHaveBeenCalled();
  });
});

// Mock Express objects
const mockRequest = (body = {}, query = {}, params = {}) => ({
  body,
  query,
  params,
}) as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('validateAll middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate request data and attach validatedData to request when successful', () => {
    const schema = z.object({
      body: z.object({ name: z.string() }),
      query: z.object({ page: z.string().optional() }),
      params: z.object({ id: z.string() }),
    });

    const req = mockRequest(
      { name: 'John' },
      { page: '1' },
      { id: '123' }
    );
    const res = mockResponse();

    const middleware = validateAll(schema);
    middleware(req, res, mockNext);

    expect(req.validatedData).toEqual({
      body: { name: 'John' },
      query: { page: '1' },
      params: { id: '123' },
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw BadRequestError when validation fails', () => {
    const schema = z.object({
      body: z.object({ email: z.string().email() }),
    });

    const req = mockRequest({ email: 'invalid-email' });
    const res = mockResponse();

    const middleware = validateAll(schema);
    
    expect(() => middleware(req, res, mockNext)).toThrow(BadRequestError);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should include all field errors in the thrown error message', () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        age: z.number().min(18),
      }),
    });

    const req = mockRequest({
      email: 'invalid-email',
      age: 15,
    });

    const res = mockResponse();
    const middleware = validateAll(schema);

    try {
      middleware(req, res, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      const err: BadRequestError = error as BadRequestError;
      expect(err.message).toContain('Validation failed');
      expect(err.message).toContain('email');
      expect(err.message).toContain('Number must be greater than or equal to 18');
    }
  });

  it('should handle empty request parts correctly', () => {
    const schema = z.object({
      body: z.object({}).optional(),
      query: z.object({}).optional(),
      params: z.object({}).optional(),
    });

    const req = mockRequest();
    const res = mockResponse();

    const middleware = validateAll(schema);
    middleware(req, res, mockNext);

    expect(req.validatedData).toEqual({
      body: {},
      query: {},
      params: {},
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should work with complex nested schemas', () => {
    const schema = z.object({
      body: z.object({
        user: z.object({
          name: z.string(),
          address: z.object({
            street: z.string(),
            city: z.string(),
          }),
        }),
      }),
    });

    const req = mockRequest({
      user: {
        name: 'Alice',
        address: {
          street: '123 Main St',
          city: 'Metropolis',
        },
      },
    });

    const res = mockResponse();
    const middleware = validateAll(schema);
    middleware(req, res, mockNext);

    expect(req.validatedData).toEqual({
      body: {
        user: {
          name: 'Alice',
          address: {
            street: '123 Main St',
            city: 'Metropolis',
          },
        },
      },
    });
    expect(mockNext).toHaveBeenCalled();
  });
});
