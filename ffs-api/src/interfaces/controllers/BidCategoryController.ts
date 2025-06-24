import { inject, injectable } from "inversify";
import { Response, Router } from "express";
import TYPES from "../../shared/dependencyInjection/types";
import { IBidCategoryService } from "../../application/contracts/IBidCategoryService";
import { asyncWrapper } from "../../shared/utils/asyncWrapper";
import { ListCategoriesResponse } from "../responses/categories/ListCategoriesResponse";
import { protectRoute } from "../middleware/protectRoute";
import { validateAll } from "../middleware/validate";
import { CreateCategoryWithValidationRequestSchema } from "../requests/categories/CreateCategoryWithValidationRequest";
import { GetCategoryByIdRequestSchema } from "../requests/categories/GetCategoryByIdRequest";
import { UpdateCategoryByIdRequestSchema } from "../requests/categories/UpdateCategoryByIdRequest";
import { DeleteCategoryByIdRequestSchema } from "../requests/categories/DeleteCategoryByIdRequest";
import { CreateCategoryResponse } from "../responses/categories/CreateCategoryResponse";
import { UpdateCategoryResponse } from "../responses/categories/UpdateCategoryResponse";
import { AuthRequest } from "../responses/base/AuthRequest";

@injectable()
export class BidCategoryController {
  private readonly router: Router;

  constructor(@inject(TYPES.IBidCategoryService) private bidCategoryService: IBidCategoryService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get(
      "/",
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.listCategories.bind(this))
    );

    this.router.get(
      "/:id",
      validateAll(GetCategoryByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.getCategoryById.bind(this))
    );

    this.router.post(
      "/",
      validateAll(CreateCategoryWithValidationRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.createCategory.bind(this))
    );

    this.router.put(
      "/:id",
      validateAll(UpdateCategoryByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.updateCategory.bind(this))
    );

    this.router.delete(
      "/:id",
      validateAll(DeleteCategoryByIdRequestSchema),
      asyncWrapper<AuthRequest>(protectRoute),
      asyncWrapper<AuthRequest>(this.deleteCategory.bind(this))
    );
  }

  public getRouter(): Router {
    return this.router;
  }

  private async listCategories(req: AuthRequest, res: Response): Promise<void> {
    const categories = await this.bidCategoryService.getAllCategories();
    
    const response: ListCategoriesResponse = categories.map(category => ({
      id: category.id!,
      external_id: category.code,
      name: category.name,
      description: category.description
    }));

    res.status(200).json(response);
  }

  private async getCategoryById(req: AuthRequest, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }

    const category = await this.bidCategoryService.getCategoryById(id);
    
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    const response: CreateCategoryResponse = {
      id: category.id!,
      external_id: category.code,
      name: category.name,
      description: category.description
    };

    res.status(200).json(response);
  }

  private async createCategory(req: AuthRequest, res: Response): Promise<void> {
    const { name, description } = req.body;
    const category = await this.bidCategoryService.createCategory(name, description);
    
    const response: CreateCategoryResponse = {
      id: category.id!,
      external_id: category.code,
      name: category.name,
      description: category.description
    };

    res.status(201).json(response);
  }

  private async updateCategory(req: AuthRequest, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    
    const category = await this.bidCategoryService.updateCategory(id, name, description);
    
    const response: UpdateCategoryResponse = {
      id: category.id!,
      external_id: category.code,
      name: category.name,
      description: category.description
    };

    res.status(200).json(response);
  }

  private async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const success = await this.bidCategoryService.deleteCategory(id);
    
    if (!success) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.status(204).send();
  }
}
