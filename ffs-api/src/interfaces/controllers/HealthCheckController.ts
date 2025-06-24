import { inject, injectable } from 'inversify';
import { Request, Response, Router } from 'express';
import TYPES from '../../shared/dependencyInjection/types';
import { asyncWrapper } from '../../shared/utils/asyncWrapper';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import bcrypt from 'bcrypt';

@injectable()
export class HealthCheckController {
  private readonly router: Router;

  constructor(@inject(TYPES.IDatabaseService) private databaseService: IDatabaseService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      '/',
      asyncWrapper(this.getHealth.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async getHealth(req: Request, res: Response): Promise<void> {
    const serverStatus: 'UP' | 'DOWN' = 'UP';
    let databaseStatus: 'UP' | 'DOWN' = 'UP';
    let details: { error: string } | undefined;

    try {
      // Attempt a simple database operation to check connectivity
      await this.databaseService.getClient().$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'DOWN';
      if (error instanceof Error) {
        details = { error: error.message };
      } else {
        details = { error: 'An unknown database error occurred' };
      }
      console.error('Database health check failed:', error);
    }

    const response = {
      status: serverStatus,
      dependencies: {
        database: {
          status: databaseStatus,
          details,
        },
      },
    };

    const passwordHash = await bcrypt.hash('222', 10);
    console.log('passwordHash', passwordHash)

    res.status(databaseStatus === 'UP' ? 200 : 503).json(response);
  }
}