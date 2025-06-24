import { Router } from 'express';
import { container } from '../../config/container';
import { BidItemController } from '../controllers/BidItemController';

const router = Router();
const bidItemController = container.get<BidItemController>(BidItemController);

router.use('/', bidItemController.getRouter());

export { router as bidItemRoutes };
