import { Request } from "express";
import { AuthResponse_User } from "./AuthResponse";

export interface AuthRequest extends Request {
  user: AuthResponse_User;
}
