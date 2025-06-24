import { User } from "../../domain/interfaces/users/User";
import { EmailVerificationCodeResponse } from "../../interfaces/responses/users/EmailVerificationCodeResponse";
import { LoginResponse } from "../../interfaces/responses/users/LoginResponse";
import { PasswordResetCodeResponse } from "../../interfaces/responses/users/PasswordResetCodeResponse";
import { PasswordResetResponse } from "../../interfaces/responses/users/PasswordResetResponse";
import { VerifyEmailResponse } from "../../interfaces/responses/users/VerifyEmailResponse";
import { ListUsersResponse } from "../../interfaces/responses/users/ListUsersResponse";
import { UpdateUserRequestData } from "../../interfaces/requests/users/UpdateUserRequest";
import { DeactivateUserResponse } from "../../interfaces/responses/users/DeactivateUserResponse";
import { ActivateUserResponse } from "../../interfaces/responses/users/ActivateUserResponse";
import { DeleteUserResponse } from "../../interfaces/responses/users/DeleteUserResponse";
import { SearchFilters } from "../../interfaces/requests/users/SearchUsersRequest";
import { AuthResponse_User } from "../../interfaces/responses/base/AuthResponse";

export interface IUserService {
  login(email: string, password: string): Promise<LoginResponse>
  // createUser(
  //   email: string,
  //   firstName: string,
  //   lastName: string,
  //   initials: string,
  //   roleId: number
  // ): Promise<CreateUserResponse>;
  getUserById(userId: number): Promise<User>;
  getUserDetails(userId: number): Promise<AuthResponse_User>;
  // createUserInTransaction(
  //   email: string,
  //   firstName: string,
  //   lastName: string,
  //   initials: string,
  //   roleId: number
  // ): Promise<CreateUserResponse>;
  passwordReset(
    email: string,
    code: string,
    newPassword: string
  ): Promise<PasswordResetResponse>;
  requestPasswordResetCode(email: string): Promise<PasswordResetCodeResponse>;
  requestEmailVerificationCode(email: string): Promise<EmailVerificationCodeResponse>;
  verifyEmail(
    email: string,
    code: string,
  ): Promise<VerifyEmailResponse>;
  
  inviteUser(invitationData: {
    fullName: string;
    email: string;
    role: string;
    bidRole?: string;
    districtId?: number;
    schoolId?: number;
  }, invitedBy: number): Promise<void>;
  
  bulkUploadUsers(file: Express.Multer.File, uploadedBy: number): Promise<{ message: string }>;
  
  listUsers(requestingUserId: number): Promise<ListUsersResponse>;
  
  searchUsers(requestingUserId: number, filters: SearchFilters): Promise<ListUsersResponse>;
  
  generateBulkUserTemplate(requestingUserId: number): Promise<string>;
  getEligibleBidManagers(requestingUserId: number): Promise<ListUsersResponse>;
  updateUser(userId: number, updateData: UpdateUserRequestData): Promise<User>;
  deactivateUser(userId: number): Promise<DeactivateUserResponse>;
  activateUser(userId: number): Promise<ActivateUserResponse>;
  deleteUser(userId: number): Promise<DeleteUserResponse>;
}
