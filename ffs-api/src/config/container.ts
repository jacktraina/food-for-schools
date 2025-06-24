import { Container } from "inversify";
import TYPES from "../shared/dependencyInjection/types";

// Core services & contracts
import { IDatabaseService } from "../application/contracts/IDatabaseService";

// Auth & Users
// import { IUserService } from "../application/contracts/IUserService";
// import { UserService } from "../application/services/UserService";
// import { IUserRepository } from "../domain/interfaces/users/IUserRepository";
// import { UserRepository } from "../infrastructure/repositories/UserRepository";
import { IPasswordResetCodeRepository } from '../domain/interfaces/passwordResetCodes/IPasswordResetCodeRepository';
import { PasswordResetCodeRepository } from '../infrastructure/repositories/PasswordResetCodeRepository';
import { IRoleRepository } from "../domain/interfaces/roles/IRoleRepository";
import { RoleRepository } from "../infrastructure/repositories/RoleRepository";
// import { IRoleService } from "../application/contracts/IRoleService";
// import { RoleService } from "../application/services/RoleService";
import { IEmailVerificationCodeRepository } from "../domain/interfaces/emailVerificationCodes/IEmailVerificationCodeRepository";
import { EmailVerificationCodeRepository } from "../infrastructure/repositories/EmailVerificationCodeRepository";
import { IUserRoleRepository } from "../domain/interfaces/userRoles/IUserRoleRepository";
import { UserRoleRepository } from "../infrastructure/repositories/UserRoleRepository";
// import { UserController } from "../interfaces/controllers/UserController";
// import { RoleController } from "../interfaces/controllers/RoleController";

import { IEmailServicePort } from "../domain/core/IEmailServicePort";
import { IOneSignalServicePort } from "../domain/core/IOneSignalServicePort";
import { EmailConfig, NodemailerAdapter } from "../infrastructure/services/NodemailerService";
import { OneSignalConfig, OneSignalAdapter } from "../infrastructure/services/OneSignalService";
import { EmailTemplates } from "../shared/emailTemplates/EmailTemplates";
import { HealthCheckController } from "../interfaces/controllers/HealthCheckController";
import { DatabaseService } from "../infrastructure/services/DatabaseService";
import { IUserRepository } from "../domain/interfaces/users/IUserRepository";
import { IUserService } from "../application/contracts/IUserService";
import { UserController } from "../interfaces/controllers/UserController";
import { UserService } from "../application/services/UserService";
import { UserRepository } from "../infrastructure/repositories/UserRepository";
import { ITaskRepository } from "../domain/interfaces/tasks/ITaskRepository";
import { TaskRepository } from "../infrastructure/repositories/TaskRepository";
import { ITaskService } from "../application/contracts/ITaskService";
import { TaskService } from "../application/services/TaskService";
import { TaskController } from "../interfaces/controllers/TaskController";
import { ISchoolRepository } from "../domain/interfaces/Schools/ISchoolRepository";
import { SchoolRepository } from "../infrastructure/repositories/SchoolRepository";
import { ISchoolService } from "../application/contracts/ISchoolService";
import { SchoolService } from "../application/services/SchoolService";
import { SchoolController } from "../interfaces/controllers/SchoolController";
import { DistrictController } from "../interfaces/controllers/DistrictController";
import { IDistrictService } from "../application/contracts/IDistrictService";
import { DistrictService } from "../application/services/DistrictService";
import { IDistrictRepository } from "../domain/interfaces/Districts/IDistrictRepository";
import { DistrictRepository } from "../infrastructure/repositories/DistrictsRepository";
import { IDistrictProductRepository } from "../domain/interfaces/DistrictProducts/IDistrictProductRepository";
import { DistrictProductRepository } from "../infrastructure/repositories/DistrictProductRepository";
import { IBidRepository } from "../domain/interfaces/Bids/IBidRepository";
import { BidRepository } from "../infrastructure/repositories/BidRepository";
import { IBidItemRepository } from "../domain/interfaces/BidItems/IBidItemRepository";
import { BidItemRepository } from "../infrastructure/repositories/BidItemRepository";
import { IBidService } from "../application/contracts/IBidService";
import { BidService } from "../application/services/BidService";
import { IBidItemService } from "../application/contracts/IBidItemService";
import { BidItemService } from "../application/services/BidItemService";
import { IVendorRepository } from "../domain/interfaces/vendors/IVendorRepository";
import { VendorRepository } from "../infrastructure/repositories/VendorRepository";
import { IVendorService } from "../application/contracts/IVendorService";
import { VendorService } from "../application/services/VendorService";
import { VendorController } from "../interfaces/controllers/VendorController";
import { IDashboardService } from "../application/contracts/IDashboardService";
import { DashboardService } from "../application/services/DashboardService";
import { DashboardController } from "../interfaces/controllers/DashboardController";
import { IInvitationRepository } from "../domain/interfaces/invitations/IInvitationRepository";
import { InvitationRepository } from "../infrastructure/repositories/InvitationRepository";
import { IBulkUploadRepository } from "../domain/interfaces/bulkUploads/IBulkUploadRepository";
import { BulkUploadRepository } from "../infrastructure/repositories/BulkUploadRepository";

import { IOrganizationService } from "../application/contracts/IOrganizationService";
import { OrganizationService } from "../application/services/OrganizationService";
import { OrganizationController } from "../interfaces/controllers/OrganizationController";
import { IOrganizationInvitationService } from "../application/contracts/IOrganizationInvitationService";
import { OrganizationInvitationService } from "../application/services/OrganizationInvitationService";
import { BidCategoryRepository } from '../infrastructure/repositories/BidCategoryRepository';
import { IBidCategoryRepository } from '../domain/interfaces/BidCategories/IBidCategoryRepository';
import { BidManagerRepository } from '../infrastructure/repositories/BidManagerRepository';
import { ContactRepository } from '../infrastructure/repositories/ContactRepository';
import { CooperativeRepository } from '../infrastructure/repositories/CooperativeRepository';
import { OrganizationContactRepository } from '../infrastructure/repositories/OrganizationContactRepository';
import { IEmailService } from "../application/contracts/IEmailService";
import { EmailService } from "../application/services/EmailService";
import { BidController } from "../interfaces/controllers/BidController";
import { BidItemController } from "../interfaces/controllers/BidItemController";
import { IBidCategoryService } from "../application/contracts/IBidCategoryService";
import { BidCategoryService } from "../application/services/BidCategoryService";
import { BidCategoryController } from "../interfaces/controllers/BidCategoryController";
import { IUSDANewsRepository } from "../domain/interfaces/USDANews/IUSDANewsRepository";
import { USDANewsRepository } from "../infrastructure/repositories/USDANewsRepository";
import { IUSDANewsService } from "../application/contracts/IUSDANewsService";
import { USDANewsService } from "../application/services/USDANewsService";
import { USDANewsController } from "../interfaces/controllers/USDANewsController";

const container = new Container();

// Core
container.bind<IDatabaseService>(TYPES.IDatabaseService).to(DatabaseService).inSingletonScope();
container.bind<EmailConfig>(TYPES.EmailConfig).toConstantValue({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_PASSWORD || ''
  }
});
container.bind<IEmailServicePort>(TYPES.IEmailServicePort)
  .to(NodemailerAdapter)
  .inSingletonScope();

container.bind<OneSignalConfig>(TYPES.OneSignalConfig).toConstantValue({
  appId: process.env.ONESIGNAL_APP_ID || '',
  apiKey: process.env.ONESIGNAL_API_KEY || ''
});

container.bind<IOneSignalServicePort>(TYPES.IOneSignalServicePort)
  .to(OneSignalAdapter)
  .inSingletonScope();

container
  .bind<EmailTemplates>(TYPES.EmailTemplates)
  .toConstantValue(new EmailTemplates(process.env.CLIENT_URL || '', process.env.CLIENT_STAFF_URL || ''));

// Repositories
container.bind<IPasswordResetCodeRepository>(TYPES.IPasswordResetCodeRepository).to(PasswordResetCodeRepository);
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);
container.bind<IRoleRepository>(TYPES.IRoleRepository).to(RoleRepository);
container.bind<IUserRoleRepository>(TYPES.IUserRoleRepository).to(UserRoleRepository);
container.bind<IEmailVerificationCodeRepository>(TYPES.IEmailVerificationCodeRepository).to(EmailVerificationCodeRepository);
container.bind<IInvitationRepository>(TYPES.IInvitationRepository).to(InvitationRepository);
container.bind<ITaskRepository>(TYPES.ITaskRepository).to(TaskRepository);
container.bind<ISchoolRepository>(TYPES.ISchoolRepository).to(SchoolRepository);
container.bind<IDistrictRepository>(TYPES.IDistrictRepository).to(DistrictRepository);
container.bind<IDistrictProductRepository>(TYPES.IDistrictProductRepository).to(DistrictProductRepository);
container.bind<IBidRepository>(TYPES.IBidRepository).to(BidRepository);
container.bind<IBidItemRepository>(TYPES.IBidItemRepository).to(BidItemRepository);
container.bind<IVendorRepository>(TYPES.IVendorRepository).to(VendorRepository);
container.bind<IBulkUploadRepository>(TYPES.IBulkUploadRepository).to(BulkUploadRepository);
container.bind<IUSDANewsRepository>(TYPES.IUSDANewsRepository).to(USDANewsRepository);

container.bind<IVendorService>(TYPES.IVendorService).to(VendorService);
container.bind<VendorController>(VendorController).toSelf();

container.bind<IBidCategoryRepository>(TYPES.IBidCategoryRepository).to(BidCategoryRepository);
container.bind(TYPES.IBidManagerRepository).to(BidManagerRepository);
container.bind(TYPES.IContactRepository).to(ContactRepository);
container.bind(TYPES.ICooperativeRepository).to(CooperativeRepository);
container.bind(TYPES.IOrganizationContactRepository).to(OrganizationContactRepository);

// Services
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<ITaskService>(TYPES.ITaskService).to(TaskService);
container.bind<ISchoolService>(TYPES.ISchoolService).to(SchoolService);
container.bind<IDistrictService>(TYPES.IDistrictService).to(DistrictService);
container.bind<IBidService>(TYPES.IBidService).to(BidService);
container.bind<IBidItemService>(TYPES.IBidItemService).to(BidItemService);
container.bind<IBidCategoryService>(TYPES.IBidCategoryService).to(BidCategoryService);
container.bind<IDashboardService>(TYPES.IDashboardService).to(DashboardService);
container.bind<IOrganizationService>(TYPES.IOrganizationService).to(OrganizationService);
container.bind<IOrganizationInvitationService>(TYPES.IOrganizationInvitationService).to(OrganizationInvitationService);
container.bind<IEmailService>(TYPES.IEmailService).to(EmailService);
container.bind<IUSDANewsService>(TYPES.IUSDANewsService).to(USDANewsService);
container.bind<EmailService>(TYPES.EmailService).to(EmailService);
// container.bind<IRoleService>(TYPES.IRoleService).to(RoleService);

// Controllers
container.bind(HealthCheckController).to(HealthCheckController);
container.bind(UserController).to(UserController);
container.bind(TaskController).to(TaskController);
container.bind(SchoolController).to(SchoolController);
container.bind(DistrictController).to(DistrictController);
container.bind(DashboardController).to(DashboardController);
container.bind(OrganizationController).to(OrganizationController);
container.bind(BidController).to(BidController);
container.bind(BidItemController).to(BidItemController);
container.bind(BidCategoryController).to(BidCategoryController);
container.bind(USDANewsController).to(USDANewsController);


// container.bind(RoleController).to(RoleController);

export { container };
