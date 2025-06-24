import { Response, Router } from "express";
import { inject, injectable } from "inversify";
import { IBidItemService } from "../../application/contracts/IBidItemService";
import { IBidItemRepository } from "../../domain/interfaces/BidItems/IBidItemRepository";
import { NotFoundError } from "../../domain/core/errors/NotFoundError";
import TYPES from "../../shared/dependencyInjection/types";
import { BidItemResponse } from "../responses/bidItems/BidItemListResponse";
import { protectRoute } from "../middleware/protectRoute";
import { asyncWrapper } from "../../shared/utils/asyncWrapper";
import { validate, validateAll } from "../middleware/validate";
import { CreateBidItemRequestSchema } from "../requests/bidItems/CreateBidItemRequest";
import { DeleteBidItemByIdRequestSchema } from "../requests/bidItems/DeleteBidItemByIdRequest";
import { UpdateBidItemByIdRequestSchema } from "../requests/bidItems/UpdateBidItemByIdRequest";
import { AuthRequest } from "../responses/base/AuthRequest";

@injectable()
export class BidItemController {
  constructor(
    @inject(TYPES.IBidItemService) private bidItemService: IBidItemService,
    @inject(TYPES.IBidItemRepository) private bidItemRepository: IBidItemRepository
  ) {}

  async getAllBidItems(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bidItemsWithBids = await this.bidItemRepository.findAll();

      const mappedBidItems: BidItemResponse[] = bidItemsWithBids.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        acceptableBrands: item.acceptableBrands || "",
        bidId: item.bidId,
        bidName: item.bid?.name || "",
        awardGroup: item.awardGroup || "",
        status: item.status || "",
        projection: item.projection || 0,
        projectionUnit: item.projectionUnit || "",
        diversion: item.diversion || "",
        minProjection: item.minProjection || 0,
        totalBidUnits: item.totalBidUnits || 0,
        bidUnit: item.bidUnit || "",
        bidUnitProjUnit: item.bidUnitProjUnit || 0,
        percentDistrictsUsing: item.percentDistrictsUsing || 0,
      }));

      res.json(mappedBidItems);
    } catch (error) {
      console.error("Error fetching bid items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getBidItemsByBidId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bidIdParam = req.params.bidId;
      if (!bidIdParam) {
        res.status(400).json({ error: "Bid ID is required" });
        return;
      }

      const bidId = parseInt(bidIdParam, 10);
      if (isNaN(bidId)) {
        res.status(400).json({ error: "Bid ID must be a valid number" });
        return;
      }

      const bidItemsWithBids = await this.bidItemRepository.findByBidId(bidId);

      const mappedBidItems: BidItemResponse[] = bidItemsWithBids.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        acceptableBrands: item.acceptableBrands || "",
        bidId: item.bidId,
        bidName: item.bid?.name || "",
        awardGroup: item.awardGroup || "",
        status: item.status || "",
        projection: item.projection || 0,
        projectionUnit: item.projectionUnit || "",
        diversion: item.diversion || "",
        minProjection: item.minProjection || 0,
        totalBidUnits: item.totalBidUnits || 0,
        bidUnit: item.bidUnit || "",
        bidUnitProjUnit: item.bidUnitProjUnit || 0,
        percentDistrictsUsing: item.percentDistrictsUsing || 0,
      }));

      res.json(mappedBidItems);
    } catch (error) {
      console.error("Error fetching bid items by bid ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getBidItemById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({ error: "Bid item ID is required" });
        return;
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Bid item ID must be a valid number" });
        return;
      }

      const bidItemWithBid = await this.bidItemRepository.findById(id);
      if (!bidItemWithBid) {
        res.status(404).json({ error: "BidItem not found" });
        return;
      }

      const mappedBidItem: BidItemResponse = {
        id: bidItemWithBid.id,
        itemName: bidItemWithBid.itemName,
        acceptableBrands: bidItemWithBid.acceptableBrands || "",
        bidId: bidItemWithBid.bidId,
        bidName: bidItemWithBid.bid?.name || "",
        awardGroup: bidItemWithBid.awardGroup || "",
        status: bidItemWithBid.status || "",
        projection: bidItemWithBid.projection || 0,
        projectionUnit: bidItemWithBid.projectionUnit || "",
        diversion: bidItemWithBid.diversion || "",
        minProjection: bidItemWithBid.minProjection || 0,
        totalBidUnits: bidItemWithBid.totalBidUnits || 0,
        bidUnit: bidItemWithBid.bidUnit || "",
        bidUnitProjUnit: bidItemWithBid.bidUnitProjUnit || 0,
        percentDistrictsUsing: bidItemWithBid.percentDistrictsUsing || 0,
      };

      res.json(mappedBidItem);
    } catch (error) {
      console.error("Error fetching bid item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createBidItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validatedData = CreateBidItemRequestSchema.parse(req.body);

      const bidItemData = {
        bidId: validatedData.bidId,
        itemName: validatedData.itemName,
        acceptableBrands: validatedData.acceptableBrands,
        awardGroup: validatedData.awardGroup,
        status: validatedData.status,
        projectionUnit: validatedData.projectionUnit,
        bidUnit: validatedData.bidUnit,
        bidUnitProjUnit: validatedData.bidUnitProjUnit,
        minProjection: validatedData.minProjection,
        diversion: validatedData.diversion,
        projection: validatedData.projection,
        totalBidUnits: validatedData.totalBidUnits,
        percentDistrictsUsing: validatedData.percentDistrictsUsing,
      };

      const bidItem = await this.bidItemService.createBidItem(bidItemData);

      const mappedBidItem: BidItemResponse = {
        id: bidItem.id,
        itemName: bidItem.itemName,
        acceptableBrands: bidItem.acceptableBrands || "",
        bidId: bidItem.bidId,
        bidName: bidItem.bid?.name || "",
        awardGroup: bidItem.awardGroup || "",
        status: bidItem.status || "",
        projection: bidItem.projection || 0,
        projectionUnit: bidItem.projectionUnit || "",
        diversion: bidItem.diversion || "",
        minProjection: bidItem.minProjection || 0,
        totalBidUnits: bidItem.totalBidUnits || 0,
        bidUnit: bidItem.bidUnit || "",
        bidUnitProjUnit: bidItem.bidUnitProjUnit || 0,
        percentDistrictsUsing: bidItem.percentDistrictsUsing || 0,
      };

      res.status(201).json(mappedBidItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async updateBidItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid bid item ID" });
        return;
      }

      const validatedData = UpdateBidItemByIdRequestSchema.parse({ params: req.params, body: req.body });

      const bidItemData = {
        itemName: validatedData.body.itemName,
        acceptableBrands: validatedData.body.acceptableBrands,
        awardGroup: validatedData.body.awardGroup,
        status: validatedData.body.status,
        projectionUnit: validatedData.body.projectionUnit,
        bidUnit: validatedData.body.bidUnit,
        bidUnitProjUnit: validatedData.body.bidUnitProjUnit,
        minProjection: validatedData.body.minProjection,
        diversion: validatedData.body.diversion,
        projection: validatedData.body.projection,
        totalBidUnits: validatedData.body.totalBidUnits,
        percentDistrictsUsing: validatedData.body.percentDistrictsUsing,
      };

      const bidItem = await this.bidItemService.updateBidItem(id, bidItemData);

      const mappedBidItem: BidItemResponse = {
        id: bidItem.id,
        itemName: bidItem.itemName,
        acceptableBrands: bidItem.acceptableBrands || "",
        bidId: bidItem.bidId,
        bidName: bidItem.bid?.name || "",
        awardGroup: bidItem.awardGroup || "",
        status: bidItem.status || "",
        projection: bidItem.projection || 0,
        projectionUnit: bidItem.projectionUnit || "",
        diversion: bidItem.diversion || "",
        minProjection: bidItem.minProjection || 0,
        totalBidUnits: bidItem.totalBidUnits || 0,
        bidUnit: bidItem.bidUnit || "",
        bidUnitProjUnit: bidItem.bidUnitProjUnit || 0,
        percentDistrictsUsing: bidItem.percentDistrictsUsing || 0,
      };

      res.json(mappedBidItem);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async deleteBidItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid bid item ID" });
        return;
      }

      await this.bidItemService.deleteBidItem(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  getRouter(): Router {
    const router = Router();

    router.post(
      "/",
      validate(CreateBidItemRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.createBidItem.bind(this))
    );

    router.get(
      "/",
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getAllBidItems.bind(this))
    );

    router.get(
      "/bid/:bidId",
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getBidItemsByBidId.bind(this))
    );

    router.get(
      "/:id",
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getBidItemById.bind(this))
    );

    router.patch(
      "/:id",
      validateAll(UpdateBidItemByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.updateBidItem.bind(this))
    );

    router.delete(
      "/:id",
      validateAll(DeleteBidItemByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deleteBidItem.bind(this))
    );

    return router;
  }
}
