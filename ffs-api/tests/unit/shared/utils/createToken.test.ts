// tests/unit/shared/utils/createToken.test.ts
import jwt from 'jsonwebtoken';
import { createToken } from '../../../../src/shared/utils/createToken';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

// 👇 Mock the config module
jest.mock('../../../../src/config/env', () => ({
  config: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1d',
  },
}));

describe('createToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if jwtSecret is not defined', async () => {
    // Re-mock with missing jwtSecret
    jest.resetModules();
    jest.doMock('../../../../src/config/env', () => ({
      config: {
        jwtSecret: undefined,
        jwtExpiresIn: '1d',
      },
    }));

    const { createToken: freshCreateToken } = await import(
      '../../../../src/shared/utils/createToken'
    );

    const userId = 123;
    expect(() => freshCreateToken(userId)).toThrowError(
      'JWT_SECRET is not defined in environment variables'
    );
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('should throw an error when jwt.sign fails', () => {
    // Force jwt.sign to throw an error
    (jwt.sign as jest.Mock).mockImplementation(() => {
      throw new Error('sign error');
    });

    const userId = 123;
    expect(() => createToken(userId)).toThrowError('Failed to create token: sign error');
  });


  it('should call jwt.sign with the correct payload and options', () => {
    (jwt.sign as jest.Mock).mockReturnValue('mocked-token');

    const userId = 123;
    const token = createToken(userId);

    expect(jwt.sign).toHaveBeenCalledWith({ id: userId }, 'test-secret', {
      expiresIn: '1d',
    });
    expect(token).toBe('mocked-token');
  });

  it('should handle non-Error thrown values from jwt.sign', () => {
    // Simulate jwt.sign throwing a string instead of an Error
    (jwt.sign as jest.Mock).mockImplementation(() => {
      throw 'something went wrong'; // Not an Error object
    });

    const userId = 123;
    expect(() => createToken(userId)).toThrowError(
      'Failed to create token: something went wrong'
    );
  });

});
