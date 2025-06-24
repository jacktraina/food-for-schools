import { User } from "../../../domain/interfaces/users/User";

export interface UpdateUserResponse {
  message: string;
  user: User;
}
