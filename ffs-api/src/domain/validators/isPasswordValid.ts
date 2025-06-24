import Validator from 'validator';

export const isPasswordValid = (password: string): void => {
  if (Validator.isEmpty(password)) {
    throw new Error('Password is empty');
  }
  if (!Validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};
