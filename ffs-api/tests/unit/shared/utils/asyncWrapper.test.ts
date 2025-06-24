import { Request, Response, NextFunction } from 'express';
import { asyncWrapper } from '../../../../src/shared/utils/asyncWrapper';

describe('asyncWrapper', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should call the wrapped function and not call next on success', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = asyncWrapper(handler);

    await wrapped(req as Request, res as Response, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error if the wrapped function throws', async () => {
    const error = new Error('Test error');
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = asyncWrapper(handler);

    await wrapped(req as Request, res as Response, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
