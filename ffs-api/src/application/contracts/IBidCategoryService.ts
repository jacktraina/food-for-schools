import { BidCategory } from "../../domain/interfaces/BidCategories/BidCategory";

export interface IBidCategoryService {
  getAllCategories(): Promise<BidCategory[]>;
  getCategoryById(id: number): Promise<BidCategory | null>;
  createCategory(name: string, description: string): Promise<BidCategory>;
  updateCategory(id: number, name: string, description: string): Promise<BidCategory>;
  deleteCategory(id: number): Promise<boolean>;
}
