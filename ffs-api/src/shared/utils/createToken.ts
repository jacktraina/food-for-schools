import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { config } from '../../config/env';

interface TokenPayload {
  id: number;
}

export const createToken = (id: number): string => {
  const secret = config.jwtSecret;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload: TokenPayload = { id };

  // Type assertion - we know these string formats are valid
  const expiresIn = config.jwtExpiresIn as StringValue;

  const options: SignOptions = {
    expiresIn,
  };

  try {
    return jwt.sign(payload, secret, options);
  } catch (error) {
    throw new Error(`Failed to create token: ${error instanceof Error ? error.message : String(error)}`);
  }
};