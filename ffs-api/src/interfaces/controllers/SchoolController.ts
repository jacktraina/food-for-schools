import { inject, injectable } from 'inversify';
import { Response, Router } from 'express';
import TYPES from '../../shared/dependencyInjection/types';
import { ISchoolService } from '../../application/contracts/ISchoolService';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { protectRoute } from '../middleware/protectRoute';
import { validate, validateAll } from '../middleware/validate';
import {
  CreateSchoolRequest,
  CreateSchoolRequestSchema,
} from '../requests/schools/CreateSchoolRequest';
import { CreateSchoolResponse } from '../responses/schools/CreateSchoolResponse';
import { AuthRequest } from '../responses/base/AuthRequest';
import { GetSchoolsRequestSchema } from '../requests/schools/GetSchoolsRequest';
import { GetSchoolByIdRequestSchema } from '../requests/schools/GetSchoolByIdRequest';
import { GetSchoolsResponse } from '../responses/schools/GetSchoolsResponse';
import { GetSchoolsDetailedResponse } from '../responses/schools/GetSchoolsDetailedResponse';
import { GetSchoolByIdResponse } from '../responses/schools/GetSchoolByIdResponse';
import {
  UpdateSchoolRequest,
  UpdateSchoolRequestSchema,
} from '../requests/schools/UpdateSchoolRequest';
import { UpdateSchoolResponse } from '../responses/schools/UpdateSchoolResponse';
import { ArchiveSchoolRequestSchema } from '../requests/schools/ArchiveSchoolRequest';
import { ActivateSchoolRequestSchema } from '../requests/schools/ActivateSchoolRequest';
import { DeleteSchoolRequestSchema } from '../requests/schools/DeleteSchoolRequest';
import { RolesEnum } from '../../domain/constants/RolesEnum';
import { AuthUtils } from '../../shared/utils/userAuthUtils';
import { DeleteSchoolResponse } from '../responses/schools/DeleteSchoolResponse';

@injectable()
export class SchoolController {
  private readonly router: Router;

  constructor(@inject(TYPES.ISchoolService) private schoolService: ISchoolService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      '/:districtId',
      validate(CreateSchoolRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.createSchool.bind(this))
    );

    this.router.get(
      '/:districtId',
      validateAll(GetSchoolsRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getSchoolsByDistrictId.bind(this))
    );

    this.router.get(
      '/detailed/:districtId',
      validateAll(GetSchoolsRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getSchoolsDetailedByDistrictId.bind(this))
    );

    this.router.put(
      '/:districtId/:id',
      validate(UpdateSchoolRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.updateSchool.bind(this))
    );

    this.router.put(
      '/:districtId/:id/archive',
      validateAll(ArchiveSchoolRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.archiveSchool.bind(this))
    );

    this.router.put(
      '/:districtId/:id/activate',
      validateAll(ActivateSchoolRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.activateSchool.bind(this))
    );

    this.router.delete(
      '/:districtId/:id',
      validateAll(DeleteSchoolRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deleteSchool.bind(this))
    );

    this.router.get(
      '/:districtId/:schoolId',
      validateAll(GetSchoolByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getSchoolById.bind(this))
    );

    this.router.get(
      '/:districtId/:schoolId/details',
      validateAll(GetSchoolByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getSchoolDetails.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async createSchool(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    const schoolData = req.body as CreateSchoolRequest;

    const school = await this.schoolService.createSchool(districtId, schoolData, userId);

    const response: CreateSchoolResponse = {
      id: school.id!,
      name: school.name,
    };

    res.status(201).json(response);
  }

  private async getSchoolsByDistrictId(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    const schools = await this.schoolService.getSchoolsByDistrictId(districtId, userId);

    const response: GetSchoolsResponse = schools.map((school) => ({
      id: school.id!,
      name: school.name,
      school_type: school.schoolType,
      enrollment: school.enrollment,
      status: school.userStatuses?.name || 'Unknown',
    }));

    res.status(200).json(response);
  }

  private async updateSchool(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);
    const schoolId = parseInt(req.params.id, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    if (isNaN(schoolId)) {
      res.status(400).json({ error: 'Invalid school ID' });
      return;
    }

    const schoolData = req.body as UpdateSchoolRequest;

    try {
      await this.schoolService.updateSchool(
        districtId,
        schoolId,
        {
          name: schoolData.name,
          enrollment: schoolData.enrollment,
          schoolType: schoolData.school_type,
          addressLine1: schoolData.address_line_1,
          addressLine2: schoolData.address_line_2,
          city: schoolData.city,
          state: schoolData.state,
          zipCode: schoolData.zip_code,
          shippingAddressLine1: schoolData.shipping_address_line_1,
          shippingAddressLine2: schoolData.shipping_address_line_2,
          shippingAddressCity: schoolData.shipping_address_city,
          shippingAddressState: schoolData.shipping_address_state,
          shippingAddressZipCode: schoolData.shipping_address_zip_code,
          schoolContactName: schoolData.school_contact_name,
          schoolContactPhone: schoolData.school_contact_phone,
          schoolContactEmail: schoolData.school_contact_email,
          notes: schoolData.notes,
          overrideDistrictBilling: schoolData.override_district_billing,
          contactFirstName: schoolData.contact_first_name,
          contactLastName: schoolData.contact_last_name,
          contactTitle: schoolData.contact_title,
          contactPhone: schoolData.contact_phone,
          contactEmail: schoolData.contact_email,
          billingContact: schoolData.billing_contact,
          billingPhone: schoolData.billing_phone,
          billingEmail: schoolData.billing_email,
          billingAddressLine1: schoolData.billing_address_line_1,
          billingAddressLine2: schoolData.billing_address_line_2,
          billingCity: schoolData.billing_city,
          billingState: schoolData.billing_state,
          billingZipCode: schoolData.billing_zip_code,
        },
        userId
      );

      const response: UpdateSchoolResponse = {
        message: 'School updated successfully',
      };

      res.status(200).json(response);
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.name === 'NotFoundError') {
        res.status(404).json({ error: err.message || 'School or district not found' });
      } else if (err?.name === 'ForbiddenError') {
        res.status(403).json({ error: err.message || 'Not authorized' });
      } else {
        res.status(400).json({ error: err?.message || 'Bad request' });
      }
    }
  }

  private async archiveSchool(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);
    const schoolId = parseInt(req.params.id, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    if (isNaN(schoolId)) {
      res.status(400).json({ error: 'Invalid school ID' });
      return;
    }

    try {
      await this.schoolService.archiveSchool(districtId, schoolId, userId);

      res.status(200).json({ message: 'School archived successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.name === 'NotFoundError') {
        res.status(404).json({ error: err.message || 'School or district not found' });
      } else if (err?.name === 'ForbiddenError') {
        res.status(403).json({ error: err.message || 'Not authorized' });
      } else {
        res.status(400).json({ error: err?.message || 'Bad request' });
      }
    }
  }

  private async activateSchool(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);
    const schoolId = parseInt(req.params.id, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    if (isNaN(schoolId)) {
      res.status(400).json({ error: 'Invalid school ID' });
      return;
    }

    try {
      await this.schoolService.activateSchool(districtId, schoolId, userId);

      res.status(200).json({ message: 'School activated successfully' });
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.name === 'NotFoundError') {
        res.status(404).json({ error: err.message || 'School or district not found' });
      } else if (err?.name === 'ForbiddenError') {
        res.status(403).json({ error: err.message || 'Not authorized' });
      } else {
        res.status(400).json({ error: err?.message || 'Bad request' });
      }
    }
  }

  private async deleteSchool(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);
    const schoolId = parseInt(req.params.id, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    if (isNaN(schoolId)) {
      res.status(400).json({ error: 'Invalid school ID' });
      return;
    }

    try {
      await this.schoolService.deleteSchool(districtId, schoolId, userId);

      const response: DeleteSchoolResponse = { message: 'School deleted successfully' };
      res.status(200).json(response);
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.name === 'NotFoundError') {
        res.status(404).json({ error: err.message || 'School or district not found' });
      } else if (err?.name === 'ForbiddenError') {
        res.status(403).json({ error: err.message || 'Not authorized' });
      } else {
        res.status(400).json({ error: err?.message || 'Bad request' });
      }
    }
  }

  private async getSchoolsDetailedByDistrictId(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    const schools = await this.schoolService.getSchoolsDetailedByDistrictId(districtId, userId);

    const response: GetSchoolsDetailedResponse = schools.map((school) => ({
      id: school.id!,
      name: school.name,
      enrollment: school.enrollment,
      shippingAddress: school.shippingFullAddress || '',
      primaryContactFirstName: null,
      primaryContactLastName: null,
      billingContactFirstName: null,
      billingContactLastName: null,
      status: school.userStatuses?.name || 'Active',
    }));

    res.status(200).json(response);
  }

  private async getSchoolById(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const districtId = parseInt(req.params.districtId, 10);
    const schoolId = parseInt(req.params.schoolId, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    if (isNaN(schoolId)) {
      res.status(400).json({ error: 'Invalid school ID' });
      return;
    }

    try {
      const school = await this.schoolService.getSchoolById(districtId, schoolId, userId);

      const response: GetSchoolByIdResponse = {
        id: school.id!,
        districtId: school.districtId,
        name: school.name,
        enrollment: school.enrollment,
        schoolType: school.schoolType,
        addressLine1: school.addressLine1,
        addressLine2: school.addressLine2,
        city: school.city,
        state: school.state,
        zipCode: school.zipCode,
        shippingAddressLine1: school.shippingAddressLine1,
        shippingAddressLine2: school.shippingAddressLine2,
        shippingAddressCity: school.shippingAddressCity,
        shippingAddressState: school.shippingAddressState,
        shippingAddressZipCode: school.shippingAddressZipCode,
        notes: school.notes,
        phone: school.phone,
        email: school.email,
        overrideDistrictBilling: school.overrideDistrictBilling,
        status: school.userStatuses?.name || 'Active',
        createdAt: school.createdAt,
        code: school.code,
        location: school.location,
        directorName: school.directorName,
        website: school.website,
        description: school.description,
        logo: school.logo,
        fullAddress: school.fullAddress,
        shippingFullAddress: school.shippingFullAddress,
      };

      res.status(200).json(response);
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.name === 'NotFoundError') {
        res.status(404).json({ error: err.message || 'School or district not found' });
      } else if (err?.name === 'ForbiddenError') {
        res.status(403).json({ error: err.message || 'Not authorized' });
      } else {
        res.status(400).json({ error: err?.message || 'Bad request' });
      }
    }
  }

  private async getSchoolDetails(req: AuthRequest, res: Response): Promise<void> {
    const user = req.user;
    const districtId = parseInt(req.params.districtId, 10);
    const schoolId = parseInt(req.params.schoolId, 10);

    if (isNaN(districtId)) {
      res.status(400).json({ error: 'Invalid district ID' });
      return;
    }

    if (isNaN(schoolId)) {
      res.status(400).json({ error: 'Invalid school ID' });
      return;
    }

    const authResult = AuthUtils.hasAnyRole(user, [
      RolesEnum.GroupAdmin,
      RolesEnum.CoopAdmin,
      RolesEnum.DistrictAdmin,
      RolesEnum.SchoolAdmin,
      RolesEnum.Viewer,
    ]);

    if (!authResult) {
      res.status(403).json({ error: 'You do not have permission to view school details' });
      return;
    }

    try {
      const schoolDetails = await this.schoolService.getSchoolDetails(districtId, schoolId);

      res.status(200).json(schoolDetails);
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.name === 'NotFoundError') {
        res.status(404).json({ error: err.message || 'School or district not found' });
      } else if (err?.name === 'ForbiddenError') {
        res.status(403).json({ error: err.message || 'Not authorized' });
      } else {
        res.status(400).json({ error: err?.message || 'Bad request' });
      }
    }
  }
}
