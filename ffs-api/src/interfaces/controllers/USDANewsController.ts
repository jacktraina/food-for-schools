import { inject, injectable } from 'inversify';
import { Response, Router } from 'express';
import TYPES from '../../shared/dependencyInjection/types';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { IUSDANewsService } from '../../application/contracts/IUSDANewsService';
import { protectRoute } from '../middleware/protectRoute';
import { AuthRequest } from '../responses/base/AuthRequest';

@injectable()
export class USDANewsController {
  private readonly router: Router;

  constructor(
    @inject(TYPES.IUSDANewsService) private usdaNewsService: IUSDANewsService
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      '/',
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getLatestNews.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async getLatestNews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const news = await this.usdaNewsService.getLatestNews();
      res.status(200).json({
        success: true,
        data: news.map(item => item.toJSON()),
        count: news.length
      });
    } catch (error) {
      console.error('Error in USDANewsController.getLatestNews:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch USDA news',
        data: [],
        count: 0
      });
    }
  }
}
