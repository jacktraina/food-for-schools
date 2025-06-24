import { inject, injectable } from 'inversify';
import { Response, Router } from 'express';
import TYPES from '../../shared/dependencyInjection/types';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { IDashboardService } from '../../application/contracts/IDashboardService';
import { protectRoute } from '../middleware/protectRoute';
import { ForbiddenError } from '../../domain/core/errors/ForbiddenError';
import { RolesEnum } from '../../domain/constants/RolesEnum';
import { AuthUtils } from '../../shared/utils/userAuthUtils';
import { AuthRequest } from '../responses/base/AuthRequest';

@injectable()
export class DashboardController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.IDashboardService) private dashboardService: IDashboardService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      '/',
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getDashboard.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      console.log(user);
      console.log('--')
      console.log(user.roles)
      const authReuslt = AuthUtils.hasAnyRole(user, [RolesEnum.GroupAdmin, RolesEnum.CoopAdmin, RolesEnum.DistrictAdmin]);
          
      if (!authReuslt) {
        throw new ForbiddenError('You do not have permission to see Dashboard');
      }

      console.log('DashboardController: Getting metrics for user ID:', user.id);
      const metrics = await this.dashboardService.getDashboardMetrics(user);
      console.log('DashboardController: Successfully retrieved metrics:', metrics);
      res.status(200).json(metrics);
    } catch (error) {
      console.error('DashboardController: Error in getDashboard:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }
}
