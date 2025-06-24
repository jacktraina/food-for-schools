import { Response, Router } from "express";
import { inject, injectable } from "inversify";
import { IBidService } from "../../application/contracts/IBidService";
import { Bid } from "../../domain/interfaces/Bids/Bid";
import { NotFoundError } from "../../domain/core/errors/NotFoundError";
import TYPES from "../../shared/dependencyInjection/types";
import { asyncWrapper } from "../../shared/utils/asyncWrapper";
import { protectRoute } from "../middleware/protectRoute";
import { validate, validateAll } from "../middleware/validate";
import { UpdateBidRequestSchema } from "../requests/bids/UpdateBidRequest";
import { CreateBidWithValidationRequest, CreateBidWithValidationRequestSchema } from "../requests/bids/CreateBidWithValidationRequest";
import { GetBidByIdRequestSchema } from "../requests/bids/GetBidByIdRequest";
import { GetBidsForBidManagerRequestSchema } from "../requests/bids/GetBidsForBidManagerRequest";
import { GetBidsByDistrictIdRequestSchema } from "../requests/bids/GetBidsByDistrictIdRequest";
import { GetBidsByCooperativeIdRequestSchema } from "../requests/bids/GetBidsByCooperativeIdRequest";
import { UpdateBidByIdRequestSchema } from "../requests/bids/UpdateBidByIdRequest";
import { DeleteBidByIdRequestSchema } from "../requests/bids/DeleteBidByIdRequest";
import { GetPaginatedBidsRequestSchema } from "../requests/bids/GetPaginatedBidsRequest";
import { BidListItem } from "../responses/bids/BidListResponse";
import { PaginatedBidsResponse } from "../responses/bids/PaginatedBidsResponse";
import { AuthRequest } from "../responses/base/AuthRequest";

@injectable()
export class BidController {
  private readonly router: Router;

  constructor(@inject(TYPES.IBidService) private bidService: IBidService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/",
      validate(CreateBidWithValidationRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.createBid.bind(this))
    );
    this.router.get("/", 
      asyncWrapper<AuthRequest>(protectRoute), 
      asyncWrapper<AuthRequest>(this.getAllBids.bind(this))
    );
    this.router.get(
      "/paginated",
      validateAll(GetPaginatedBidsRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getPaginatedBids.bind(this))
    );
    this.router.get(
      "/:id",
      validateAll(GetBidByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getBidById.bind(this))
    );
    this.router.get(
      "/manager/:bidManagerId",
      validateAll(GetBidsForBidManagerRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getBidsForBidManager.bind(this))
    );
    this.router.get(
      "/district/:districtId",
      validateAll(GetBidsByDistrictIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getBidsByDistrictId.bind(this))
    );
    this.router.get(
      "/cooperative/:cooperativeId",
      validateAll(GetBidsByCooperativeIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getBidsByCooperativeId.bind(this))
    );
    this.router.patch(
      "/:id",
      validateAll(UpdateBidByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.updateBid.bind(this))
    );
    this.router.delete(
      "/:id",
      validateAll(DeleteBidByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deleteBid.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  async createBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      const validatedData = req.body as CreateBidWithValidationRequest;

      const bidData = {
        name: validatedData.name,
        note: validatedData.note,
        bidYear: validatedData.bidYear,
        categoryId: validatedData.categoryId,
        status: validatedData.status,
        awardType: validatedData.awardType,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        anticipatedOpeningDate: validatedData.anticipatedOpeningDate
          ? new Date(validatedData.anticipatedOpeningDate)
          : undefined,
        awardDate: validatedData.awardDate ? new Date(validatedData.awardDate) : undefined,
        userId: validatedData.bidManagerId,
        description: validatedData.description,
        estimatedValue: validatedData.estimatedValue,
        cooperativeId: user?.cooperativeId || validatedData.cooperativeId,
        districtId: user?.districtId || validatedData.districtId,
      };

      const bid = await this.bidService.createBid(bidData);
      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async getBidById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid bid ID" });
        return;
      }

      const bidDetails = await this.bidService.getBidDetailsById(id);
      res.json(bidDetails);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async getAllBids(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      let bids: Bid[];
      if (user && (user.cooperativeId || user.districtId)) {
        bids = await this.bidService.getBidsForUser(user);
      } else {
        bids = await this.bidService.getAllBids();
      }

      const mappedBids: BidListItem[] = bids.map((bid) => ({
        id: bid.id?.toString() || "",
        name: bid.name || "",
        bidYear: bid.bidYear || "",
        status: bid.status || "",
        awardType: bid.awardType || "",
        startDate: bid.startDate || null,
        endDate: bid.endDate || null,
        anticipatedOpeningDate: bid.anticipatedOpeningDate || null,
        bidManagerId: bid.userId?.toString() || "",
        organizationId: "",
        organizationType: "",
        note: bid.note || "",
        category: "",
        description: bid.description || "",
        estimatedValue: bid.estimatedValue || "",
        awardDate: bid.awardDate || null,
        external_id: bid.code || "",
      }));

      res.json(mappedBids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getBidsForBidManager(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bidManagerId = parseInt(req.params.bidManagerId);
      if (isNaN(bidManagerId)) {
        res.status(400).json({ error: "Invalid bid manager ID" });
        return;
      }

      const bids = await this.bidService.getBidsForBidManager(bidManagerId);
      res.json(bids);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getBidsByDistrictId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const districtId = parseInt(req.params.districtId);
      if (isNaN(districtId)) {
        res.status(400).json({ error: "Invalid district ID" });
        return;
      }

      const bids = await this.bidService.getBidsByDistrictId(districtId);

      const mappedBids: BidListItem[] = bids.map((bid) => ({
        id: bid.id?.toString() || "",
        name: bid.name || "",
        bidYear: bid.bidYear || "",
        status: bid.status || "",
        awardType: bid.awardType || "",
        startDate: bid.startDate || null,
        endDate: bid.endDate || null,
        anticipatedOpeningDate: bid.anticipatedOpeningDate || null,
        bidManagerId: bid.userId?.toString() || "",
        organizationId: "",
        organizationType: "",
        note: bid.note || "",
        category: "",
        description: bid.description || "",
        estimatedValue: bid.estimatedValue || "",
        awardDate: bid.awardDate || null,
        external_id: bid.code || "",
      }));

      res.json(mappedBids);
    } catch (error) {
      console.error("Error fetching bids by district:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getBidsByCooperativeId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cooperativeId = parseInt(req.params.cooperativeId);
      if (isNaN(cooperativeId)) {
        res.status(400).json({ error: "Invalid cooperative ID" });
        return;
      }

      const bids = await this.bidService.getBidsByCooperativeId(cooperativeId);

      const mappedBids: BidListItem[] = bids.map((bid) => ({
        id: bid.id?.toString() || "",
        name: bid.name || "",
        bidYear: bid.bidYear || "",
        status: bid.status || "",
        awardType: bid.awardType || "",
        startDate: bid.startDate || null,
        endDate: bid.endDate || null,
        anticipatedOpeningDate: bid.anticipatedOpeningDate || null,
        bidManagerId: bid.userId?.toString() || "",
        organizationId: "",
        organizationType: "",
        note: bid.note || "",
        category: "",
        description: bid.description || "",
        estimatedValue: bid.estimatedValue || "",
        awardDate: bid.awardDate || null,
        external_id: bid.code || "",
      }));

      res.json(mappedBids);
    } catch (error) {
      console.error("Error fetching bids by cooperative:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid bid ID" });
        return;
      }

      const validatedData = UpdateBidRequestSchema.parse(req.body);

      const bidData = {
        name: validatedData.name,
        note: validatedData.note,
        bidYear: validatedData.bidYear,
        categoryId: validatedData.categoryId,
        status: validatedData.status,
        awardType: validatedData.awardType,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        anticipatedOpeningDate: validatedData.anticipatedOpeningDate
          ? new Date(validatedData.anticipatedOpeningDate)
          : undefined,
        awardDate: validatedData.awardDate ? new Date(validatedData.awardDate) : undefined,
        userId: validatedData.userId,
        description: validatedData.description,
        estimatedValue: validatedData.estimatedValue,
        cooperativeId: validatedData.cooperativeId,
        districtId: validatedData.districtId,
      };

      const bid = await this.bidService.updateBid(id, bidData);
      res.json(bid);
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

  async getPaginatedBids(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, search, bidYear, status, awardType, myBids, districtId, cooperativeId } = req.query as {
        page?: string;
        limit?: string;
        search?: string;
        bidYear?: string;
        status?: string;
        awardType?: string;
        myBids?: string;
        districtId?: string;
        cooperativeId?: string;
      };
      
      const pageNum = parseInt(page ?? '1') || 1;
      const limitNum = Math.min(parseInt(limit ?? '10') || 10, 100);
      
      const userId = myBids === 'true' ? (req as { user?: { id: number } }).user?.id : undefined;
      
      const user = req.user;
      let finalCooperativeId: number | undefined;
      let finalDistrictId: number | undefined;
      
      if (user && (user.cooperativeId || user.districtId)) {
        if (user.cooperativeId) {
          finalCooperativeId = user.cooperativeId;
        } else if (user.districtId) {
          finalDistrictId = user.districtId;
        }
      } else {
        finalCooperativeId = cooperativeId ? parseInt(cooperativeId) : undefined;
        finalDistrictId = districtId ? parseInt(districtId) : undefined;
      }
      
      const result = await this.bidService.getPaginatedBids({
        page: pageNum,
        limit: limitNum,
        search,
        bidYear,
        status,
        awardType,
        userId,
        districtId: finalDistrictId,
        cooperativeId: finalCooperativeId
      });

      const totalPages = Math.ceil(result.total / limitNum);

      const response: PaginatedBidsResponse = {
        bids: result.bids.map(bid => ({
          id: bid.id?.toString() || '',
          name: bid.name || '',
          bidYear: bid.bidYear || '',
          status: bid.status || '',
          awardType: bid.awardType || '',
          startDate: bid.startDate || null,
          endDate: bid.endDate || null,
          anticipatedOpeningDate: bid.anticipatedOpeningDate || null,
          bidManagerId: bid.userId?.toString() || '',
          bidManagerName: '',
          organizationId: (bid.cooperativeId || bid.districtId)?.toString() || '',
          organizationType: bid.cooperativeId ? 'cooperative' : 'district',
          note: bid.note || '',
          category: '',
          description: bid.description || '',
          estimatedValue: bid.estimatedValue || '',
          awardDate: bid.awardDate || null,
          external_id: bid.code || ''
        })),
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching paginated bids:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteBid(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid bid ID" });
        return;
      }

      await this.bidService.deleteBid(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
