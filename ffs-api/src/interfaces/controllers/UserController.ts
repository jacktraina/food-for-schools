import { inject, injectable } from "inversify";
import { Request, Response, Router } from "express";
import TYPES from "../../shared/dependencyInjection/types";
import { IUserService } from "../../application/contracts/IUserService";
import { validate, validateAll } from "../middleware/validate";
import { LoginRequest, LoginRequestSchema } from "../requests/users/LoginRequest";
import { asyncWrapper } from "../../shared/utils/asyncWrapper";
// import { CreateUserRequest, CreateUserRequestSchema } from "../requests/users/CreateUserRequest";
import { protectRoute } from "../middleware/protectRoute";
import { AuthRequest } from "../responses/base/AuthRequest";
// import { CreateUserResponse } from "../responses/users/CreateUserResponse";
import { LoginResponse } from "../responses/users/LoginResponse";
import { ForbiddenError } from "../../domain/core/errors/ForbiddenError";
import { PasswordResetCodeRequest, PasswordResetCodeRequestSchema } from '../requests/users/PasswordResetCodeRequest';
import { EmailVerificationCodeRequest, EmailVerificationCodeRequestSchema } from '../requests/users/EmailVerificationCodeRequest';
import { VerifyEmailRequest, VerifyEmailRequestSchema } from '../requests/users/VerifyEmailRequest';
import { PasswordResetResponse } from '../responses/users/PasswordResetResponse';
import { PasswordResetCodeResponse } from '../responses/users/PasswordResetCodeResponse';
import { EmailVerificationCodeResponse } from '../responses/users/EmailVerificationCodeResponse';
import { VerifyEmailResponse } from '../responses/users/VerifyEmailResponse';
import { PasswordResetRequest, PasswordResetRequestSchema } from "../requests/users/PasswordResetRequest";
import { InviteUserRequest, InviteUserRequestSchema } from "../requests/users/InviteUserRequest";
import { UpdateUserRequestData, UpdateUserRequestSchema } from "../requests/users/UpdateUserRequest";
import { UpdateUserResponse } from "../responses/users/UpdateUserResponse";
import { ListUsersResponse } from "../responses/users/ListUsersResponse";
import multer from "multer";
import { BadRequestError } from "../../domain/core/errors/BadRequestError";
import { DeactivateUserRequest, DeactivateUserRequestSchema } from "../requests/users/DeactivateUserRequest";
import { ActivateUserRequest, ActivateUserRequestSchema } from "../requests/users/ActivateUserRequest";
import { DeleteUserRequest, DeleteUserRequestSchema } from "../requests/users/DeleteUserRequest";
import { SearchUsersRequestSchema } from "../requests/users/SearchUsersRequest";
import { RolesEnum } from "../../domain/constants/RolesEnum";
import { LoginResponseMapper } from "../../application/mappers/LoginResponseMapper";
import { AuthUtils } from "../../shared/utils/userAuthUtils";

@injectable()
export class UserController {
  private readonly router: Router;
  private upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv') {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  constructor(@inject(TYPES.IUserService) private userService: IUserService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/login",
      validate(LoginRequestSchema),
      asyncWrapper(this.login.bind(this))
    );

    // this.router.post(
    //   "/create-user",
    //   validate(CreateUserRequestSchema),
    //   asyncWrapper(protectRoute),
    //   asyncWrapper(this.createUser.bind(this))
    // );

    this.router.post(
      '/invite',
      validate(InviteUserRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.inviteUser.bind(this))
    );

    this.router.post(
      '/reset-password',
      validate(PasswordResetRequestSchema),
      asyncWrapper(this.passwordReset.bind(this))
    );

    this.router.post(
      '/request-password-reset-code',
      validate(PasswordResetCodeRequestSchema),
      asyncWrapper(this.requestPasswordResetCode.bind(this))
    );
    this.router.post(
      '/request-email-verification-code',
      validate(EmailVerificationCodeRequestSchema),
      asyncWrapper(this.requestEmailVerificationCode.bind(this))
    );
    this.router.post(
      '/verify-email',
      validate(VerifyEmailRequestSchema),
      asyncWrapper(this.verifyEmail.bind(this))
    );
    
    this.router.get(
      '/',
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.listUsers.bind(this))
    );

    this.router.get(
      '/search',
      validateAll(SearchUsersRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.searchUsers.bind(this))
    );
    
    this.router.post(
      '/bulk-upload',
      this.upload.single('file'),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.bulkUploadUsers.bind(this))
    );

    this.router.get(
      '/bulk-upload/template',
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.downloadBulkUploadTemplate.bind(this))
    );

    this.router.get(
      '/eligible-bid-managers',
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getEligibleBidManagers.bind(this))
    );

    this.router.put(
      '/:userId',
      asyncWrapper<AuthRequest>(protectRoute),
      validateAll(UpdateUserRequestSchema),
      asyncWrapper<AuthRequest>(this.updateUser.bind(this))
    );

    this.router.put(
      '/:id/deactivate',
      validateAll(DeactivateUserRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deactivateUser.bind(this))
    );

    this.router.put(
      '/:id/activate',
      validateAll(ActivateUserRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.activateUser.bind(this))
    );

    this.router.delete(
      '/:id',
      validateAll(DeleteUserRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deleteUser.bind(this))
    );

    this.router.get(
      '/:id',
      asyncWrapper(protectRoute),
      asyncWrapper(this.getUserById.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as LoginRequest;
    const response: LoginResponse = await this.userService.login(email.trim().toLocaleLowerCase(), password);
    res.status(200).json(response);
  }

  // private async createUser(req: Request, res: Response): Promise<void> {
  //   const { email, firstName, middleName, lastName, roleId } = req.body as CreateUserRequest;
  //   const { role, user } = req as unknown as AuthRequest;
    
  //   const generatedInitials = getInitials(firstName, middleName, lastName);

  //   if (!user || role !== UserRole.ADMIN) {
  //     throw new ForbiddenError('Forbidden');
  //   }

  //   const response: CreateUserResponse = await this.userService.createUserInTransaction(
  //     email.toLocaleLowerCase(), firstName, lastName, generatedInitials, roleId);
  //   res.status(200).json(response);
  // }

  private async passwordReset(req: Request, res: Response): Promise<void> {
    const { email, code, newPassword } = req.body as PasswordResetRequest;
    const response: PasswordResetResponse = await this.userService.passwordReset(
      email.trim().toLocaleLowerCase(),
      code,
      newPassword
    );

    res.status(200).json(response);
  }

  private async requestPasswordResetCode(req: Request, res: Response): Promise<void> {
    const { email } = req.body as PasswordResetCodeRequest;
    const response: PasswordResetCodeResponse = await this.userService.requestPasswordResetCode(
      email.trim().toLocaleLowerCase(),
    );

    res.status(200).json(response);
  }

  private async requestEmailVerificationCode(req: Request, res: Response): Promise<void> {
    const { email } = req.body as EmailVerificationCodeRequest;
    const response: EmailVerificationCodeResponse = await this.userService.requestEmailVerificationCode(
      email.trim().toLocaleLowerCase(),
    );

    res.status(200).json(response);
  }

  private async verifyEmail(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body as VerifyEmailRequest;
    const response: VerifyEmailResponse = await this.userService.verifyEmail(
      email.trim().toLocaleLowerCase(),
      code
    );

    res.status(200).json(response);
  }

  private async inviteUser(req: AuthRequest, res: Response): Promise<void> {
    const { full_name, email, role, bid_role, district_id, school_id } = req.body as InviteUserRequest;
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }
      const authReuslt = AuthUtils.hasAnyRole(user, [RolesEnum.GroupAdmin, RolesEnum.CoopAdmin, RolesEnum.DistrictAdmin]);
          
      if (!authReuslt) {
      throw new ForbiddenError('You do not have permission to invite users');
    }

    await this.userService.inviteUser({
      fullName: full_name,
      email: email.trim().toLowerCase(),
      role,
      bidRole: bid_role,
      districtId: district_id,
      schoolId: school_id
    }, user.id);

    res.status(201).json({ message: 'User invitation sent' });
  }
  
  private async listUsers(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    const users: ListUsersResponse = await this.userService.listUsers(user.id);
    res.status(200).json(users);
  }

  private async searchUsers(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    const { search, role, bidRole, status, district } = req.query as {
      search?: string;
      role?: string;
      bidRole?: string;
      status?: string;
      district?: string;
    };

    const filters = {
      search,
      role,
      bidRole,
      status,
      district
    };

    const users: ListUsersResponse = await this.userService.searchUsers(user.id, filters);
    res.status(200).json(users);
  }
  
  private async bulkUploadUsers(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    const file = req.file;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    if (!file) {
      throw new BadRequestError('No file uploaded');
    }

    

      const authReuslt = AuthUtils.hasAnyRole(user, [RolesEnum.GroupAdmin, RolesEnum.CoopAdmin, RolesEnum.DistrictAdmin]);
          
      if (!authReuslt) {
      throw new ForbiddenError('You do not have permission to bulk upload users');
    }

    const result = await this.userService.bulkUploadUsers(file, user.id);
    res.status(201).json(result);
  }

  private async downloadBulkUploadTemplate(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    const csvContent = await this.userService.generateBulkUserTemplate(user.id);
    
    res.setHeader('Content-Disposition', 'attachment; filename=bulk_user_template.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvContent);
  }

  private async getEligibleBidManagers(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    const users: ListUsersResponse = await this.userService.getEligibleBidManagers(user.id);
    res.status(200).json(users);
  }

  private async updateUser(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    const { userId } = req.params;
    const updateData: UpdateUserRequestData = req.body;

    const updatedUser = await this.userService.updateUser(
      parseInt(userId, 10),
      updateData
    );

    const response: UpdateUserResponse = {
      message: "User updated successfully",
      user: updatedUser
    };

    res.status(200).json(response);
  }

  private async getUserById(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

      const authReuslt = AuthUtils.hasAnyRole(user, [RolesEnum.GroupAdmin, RolesEnum.CoopAdmin, RolesEnum.DistrictAdmin]);
          
      if (!authReuslt) {
      throw new ForbiddenError('You do not have permission to view user details');
    }

    const targetUser = await this.userService.getUserDetails(parseInt(id));
    res.status(200).json(LoginResponseMapper.mapFromAuthResponse(targetUser));
  }

  private async deactivateUser(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    console.log('User roles:', user);

    const validatedData = req.validatedData as DeactivateUserRequest;
    const userId = parseInt(validatedData.params.id, 10);
    const result = await this.userService.deactivateUser(userId);

    res.status(200).json(result);
  }

  private async activateUser(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    console.log('User roles:', user);

    const validatedData = req.validatedData as ActivateUserRequest;
    const userId = parseInt(validatedData.params.id, 10);
    const result = await this.userService.activateUser(userId);

    res.status(200).json(result);
  }

  private async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }
    
          const authReuslt = AuthUtils.hasAnyRole(user, [RolesEnum.GroupAdmin, RolesEnum.CoopAdmin, RolesEnum.DistrictAdmin]);
              
          if (!authReuslt) {
      throw new ForbiddenError('You do not have permission to delete users');
    }

    const validatedData = req.validatedData as DeleteUserRequest;
    const userId = parseInt(validatedData.params.id, 10);
    const result = await this.userService.deleteUser(userId);

    res.status(200).json(result);
  }
}
