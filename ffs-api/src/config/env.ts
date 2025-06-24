import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  connectionString: process.env.DATABASE_URL,
  jwtSecret: process.env.SECRET_JWT || "6b22e13a6431e1cce373936f30f324d801e278c1e970d89536zdvdd64gdg49d49d4gd93af3209b64cb38f0331913ff",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || "1", // in days
  saltRounds: 10,
  verificationCodeExpiration: 1 * 60 * 60 * 1000, // 1 hour,
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  companyName: process.env.COMPANY_NAME || 'FFS',
  emailHost: process.env.EMAIL_HOST || 'smtp.example.com',
  emailPort: process.env.EMAIL_PORT || '587',
  emailSecure: process.env.EMAIL_SECURE || 'false',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
};
