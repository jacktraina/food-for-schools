import { inject, injectable } from 'inversify';
import { Response, Router } from 'express';
import TYPES from '../../shared/dependencyInjection/types';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { validate, validateAll } from '../middleware/validate';
import { IDistrictService } from '../../application/contracts/IDistrictService';
import {
  CreateDistrictRequest,
  CreateDistrictRequestSchema,
} from '../requests/district/CreateDistrictRequest';
import { CreateDistrictResponse } from '../responses/district/CreateDistrictResponse';
import { protectRoute } from '../middleware/protectRoute';
import { AuthRequest } from '../responses/base/AuthRequest';
import { GetDistrictListResponse } from '../responses/district/GetDistrictListResponse';
import { UpdateDistrictRequest, UpdateDistrictRequestSchema } from '../requests/district/UpdateDistrictRequest';
import {
  GetDistrictDetailsRequest,
  GetDistrictDetailsRequestSchema,
} from '../requests/district/GetDistrictDetailsRequest';
import { DeactivateDistrictRequest, DeactivateDistrictRequestSchema } from '../requests/district/DeactivateDistrictRequest';
import { ActivateDistrictRequest, ActivateDistrictRequestSchema } from '../requests/district/ActivateDistrictRequest';
import {
  DeleteDistrictRequest,
  DeleteDistrictRequestSchema,
} from '../requests/district/DeleteDistrictRequest';
import { StatusEnum } from '../../domain/constants/StatusEnum';

@injectable()
export class DistrictController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.IDistrictService) private districtService: IDistrictService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      '/',
      validate(CreateDistrictRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.createDistrict.bind(this))
    );

    this.router.get(
      '/',
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getDistrictLists.bind(this))
    );

    this.router.put(
      '/:districtId',
      validateAll(UpdateDistrictRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.updateDistrict.bind(this))
    );

    this.router.get(
      '/:districtId',
      validateAll(GetDistrictDetailsRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getDistrictDetails.bind(this))
    );

    this.router.put(
      '/:id/deactivate',
      validateAll(DeactivateDistrictRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deactivateDistrict.bind(this))
    );

    this.router.put(
      '/:id/activate',
      validateAll(ActivateDistrictRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.activateDistrict.bind(this))
    );

    this.router.delete(
      '/:districtId',
      validateAll(DeleteDistrictRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deleteDistrict.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async createDistrict(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    console.log('User roles:', user);

    const cooperativeId = user.cooperativeId || 0;
    const districtData = req.body as CreateDistrictRequest;

    const district = await this.districtService.createDistrict(
      districtData,
      StatusEnum.ACTIVE,
      cooperativeId,
    );

    const response: CreateDistrictResponse = {
      id: district.id!,
      name: district.name,
    };

    res.status(201).json(response);
  }

  private async getDistrictLists(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    const cooperativeId = user.cooperativeId;
    if (!cooperativeId) {
      res.status(400).json({ error: 'User must be associated with a cooperative' });
      return;
    }

    const response: GetDistrictListResponse[] = await this.districtService.getDistrictLists(cooperativeId);
    res.status(200).json(response);
  }

  async updateDistrict(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    console.log('User roles:', user);

    const validatedData = req.validatedData as UpdateDistrictRequest;
    const districtId = parseInt(validatedData.params.districtId, 10);
    const updateData = validatedData.body;
    const districtDetails = await this.districtService.updateDistrict(
      districtId,
      updateData
    );

    res.status(200).json(districtDetails);
  }

  async getDistrictDetails(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;

    // TODO
    console.log('User roles:', user);
    // if (!roles.includes('Group Admin')) {
    //   res.status(403).json({ error: 'Unauthorized' });
    //   return;
    // }

    const validatedData = req.validatedData as GetDistrictDetailsRequest;
    const districtId = parseInt(validatedData.params.districtId, 10);
    const districtDetails = await this.districtService.getDistrictDetails(
      districtId
    );

    res.status(200).json(districtDetails);
  }

  async deactivateDistrict(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    console.log('User roles:', user);

    const validatedData = req.validatedData as DeactivateDistrictRequest;
    const districtId = parseInt(validatedData.params.id, 10);
    const districtDetails = await this.districtService.deactivateDistrict(
      districtId
    );

    res.status(200).json(districtDetails);
  }

  async activateDistrict(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    console.log('User roles:', user);

    const validatedData = req.validatedData as ActivateDistrictRequest;
    const districtId = parseInt(validatedData.params.id, 10);
    const districtDetails = await this.districtService.activateDistrict(
      districtId
    );

    res.status(200).json(districtDetails);
  }

  async deleteDistrict(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    console.log('User roles:', user);

    const validatedData = req.validatedData as DeleteDistrictRequest;
    const districtId = parseInt(validatedData.params.districtId, 10);
    const response = await this.districtService.deleteDistrict(
      districtId
    );

    res.status(200).json(response);
  }

}
