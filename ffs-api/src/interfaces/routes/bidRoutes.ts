import { Router } from 'express';
import { container } from '../../config/container';
import { BidController } from '../controllers/BidController';
import { BidItemController } from '../controllers/BidItemController';

const router = Router();
const bidController = container.get(BidController);
const bidItemController = container.get(BidItemController);

router.use('/bids', bidController.getRouter());
router.use('/bid-items', bidItemController.getRouter());

export default router;
