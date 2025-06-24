import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';
import { authenticateToken } from '../../shared/utils/authenticateToken';
import { AuthResponse_User } from '../responses/base/AuthResponse';

interface AuthRequest extends Request {
  user: AuthResponse_User;
  role: string;
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authResult = await authenticateToken(req);

  if (!authResult || !authResult.user) {
    throw new AppError('Invalid authentication token or role missing.', 403);
  }

  (req as AuthRequest).user = authResult.user;
  //(req as AuthRequest).role = authResult.role;

  next();
};
