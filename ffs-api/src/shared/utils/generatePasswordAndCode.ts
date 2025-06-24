import { randomInt } from 'crypto';

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIALS = "!@#$%^&*()-_=+[]{}|;:,.<>?/";
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIALS;
//const CHARSET = UPPERCASE + DIGITS + LOWERCASE;
const DEFAULT_PASSWORD_LENGTH = 15;

function getRandomChar(str: string): string {
  const index = randomInt(0, str.length);
  return str.charAt(index);
}

function shuffleString(str: string): string {
  const array = str.split("");
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join("");
}

export const generatePassword = (): string => {
  const length = DEFAULT_PASSWORD_LENGTH;

  let password = "";
  password += getRandomChar(UPPERCASE);
  password += getRandomChar(LOWERCASE);
  password += getRandomChar(DIGITS);
  password += getRandomChar(SPECIALS);

  for (let i = 4; i < length; i++) {
    password += getRandomChar(ALL_CHARS);
  }

  return shuffleString(password);
};

export const generateVerificationCode = (): string => {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};