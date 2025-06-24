import { inject, injectable } from "inversify";
import { Response, Router } from "express";
import TYPES from "../../shared/dependencyInjection/types";
import { IOrganizationService } from "../../application/contracts/IOrganizationService";
import { IOrganizationInvitationService } from "../../application/contracts/IOrganizationInvitationService";
import { validate } from "../middleware/validate";
import { asyncWrapper } from "../../shared/utils/asyncWrapper";
import { protectRoute } from "../middleware/protectRoute";
import { AuthRequest } from "../responses/base/AuthRequest";
import { ForbiddenError } from "../../domain/core/errors/ForbiddenError";
import { InviteOrganizationRequest, InviteOrganizationRequestSchema } from "../requests/organizations/InviteOrganizationRequest";
import { AcceptOrganizationInviteRequest, AcceptOrganizationInviteRequestSchema } from "../requests/organizations/AcceptOrganizationInviteRequest";
import { UpdateOrganizationRequest, UpdateOrganizationRequestSchema } from "../requests/organizations/UpdateOrganizationRequest";

@injectable()
export class OrganizationController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.IOrganizationService) private organizationService: IOrganizationService,
    @inject(TYPES.IOrganizationInvitationService) private organizationInvitationService: IOrganizationInvitationService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/invite",
      validate(InviteOrganizationRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.inviteOrganization.bind(this))
    );

    this.router.post(
      "/invite/accept",
      validate(AcceptOrganizationInviteRequestSchema),
      asyncWrapper(this.acceptOrganizationInvite.bind(this))
    );

    this.router.put(
      "/:id",
      validate(UpdateOrganizationRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.updateOrganization.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async inviteOrganization(req: AuthRequest, res: Response): Promise<void> {
    const { email, organization_type, name } = req.body as InviteOrganizationRequest;
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    const result = await this.organizationService.inviteOrganization({
      email: email.trim().toLowerCase(),
      organization_type,
      name
    }, user.id);

    res.status(201).json(result);
  }

  private async acceptOrganizationInvite(req: AuthRequest, res: Response): Promise<void> {
    const { email, password, first_name, last_name, token } = req.body as AcceptOrganizationInviteRequest;

    const result = await this.organizationInvitationService.acceptInvitation(
      email.trim().toLowerCase(),
      password,
      first_name,
      last_name,
      token
    );

    res.status(201).json(result);
  }

  private async updateOrganization(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body as UpdateOrganizationRequest;
    const user = req.user;

    if (!user) {
      throw new ForbiddenError('Authentication required');
    }

    const result = await this.organizationService.updateOrganization(
      parseInt(id, 10),
      updateData,
      user.id
    );

    res.status(200).json(result);
  }
}
