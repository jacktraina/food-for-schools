import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { AppError } from '../../interfaces/middleware/errorHandler';
import { config } from '../../config/env';
import { container } from '../../config/container';
import TYPES from '../dependencyInjection/types';
import { IUserService } from '../../application/contracts/IUserService';
import { AuthResponse_User } from '../../interfaces/responses/base/AuthResponse';

interface JwtPayload {
  id: number;
}

export const authenticateToken = async (
  req: Request
): Promise<{ user: AuthResponse_User | null; }> => {
  const authHeader = req.headers['authorization']; // Use Express's headers object
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (!token) {
    throw new AppError('Token is missing', 401);
  }

  if (!config.jwtSecret) {
    throw new AppError(
      'SECRET_JWT is not defined in the environment variables',
      500
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    if (!decoded || !decoded.id) {
      throw new AppError('Invalid token payload', 401);
    }

    const userService = container.get<IUserService>(TYPES.IUserService);

    const user = await userService.getUserDetails(decoded.id);
    if (!user) {
      throw new AppError('User not found', 403);
    }

    return { user };
  } catch (error) {
    if (error instanceof AppError) throw error;
    //console.error('Invalid token:', error);
    return { user: null };
  }
};
