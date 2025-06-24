import { inject, injectable } from "inversify";
import { Request, Response, Router } from "express";
import TYPES from "../../shared/dependencyInjection/types";
import { IVendorService } from "../../application/contracts/IVendorService";
import { validate } from "../middleware/validate";
import { RegisterVendorRequest, RegisterVendorRequestSchema } from "../requests/vendors/RegisterVendorRequest";
import { asyncWrapper } from "../../shared/utils/asyncWrapper";
import { RegisterVendorResponse } from "../responses/vendors/RegisterVendorResponse";
import { OrganizationsResponse } from "../responses/vendors/OrganizationsResponse";

@injectable()
export class VendorController {
  private readonly router: Router;

  constructor(@inject(TYPES.IVendorService) private vendorService: IVendorService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/register",
      validate(RegisterVendorRequestSchema),
      asyncWrapper(this.registerVendor.bind(this))
    );

    this.router.get(
      "/organizations",
      asyncWrapper(this.getOrganizations.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async registerVendor(req: Request, res: Response): Promise<void> {
    const { companyName, firstName, lastName, email, password, organizationId, organizationType } = req.body as RegisterVendorRequest;
    
    const response: RegisterVendorResponse = await this.vendorService.registerVendor(
      companyName,
      firstName,
      lastName,
      email.trim().toLowerCase(),
      password,
      organizationId,
      organizationType
    );
    
    res.status(201).json(response);
  }

  private async getOrganizations(req: Request, res: Response): Promise<void> {
    const organizations = await this.vendorService.getTopLevelOrganizations();
    
    const response: OrganizationsResponse = {
      organizations
    };
    
    res.status(200).json(response);
  }
}
