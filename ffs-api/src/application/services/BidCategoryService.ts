import { inject, injectable } from 'inversify';
import { IBidCategoryRepository } from '../../domain/interfaces/BidCategories/IBidCategoryRepository';
import { IBidCategoryService } from '../contracts/IBidCategoryService';
import { BidCategory } from '../../domain/interfaces/BidCategories/BidCategory';
import TYPES from '../../shared/dependencyInjection/types';

@injectable()
export class BidCategoryService implements IBidCategoryService {
  constructor(
    @inject(TYPES.IBidCategoryRepository) private bidCategoryRepository: IBidCategoryRepository
  ) {}

  async getAllCategories(): Promise<BidCategory[]> {
    return await this.bidCategoryRepository.findAll();
  }

  async getCategoryById(id: number): Promise<BidCategory | null> {
    return await this.bidCategoryRepository.findById(id);
  }

  async createCategory(name: string, description: string): Promise<BidCategory> {
    const code = name.toLowerCase().replace(/\s+/g, '_');
    const category = new BidCategory({ name, description, code });
    return await this.bidCategoryRepository.create(category);
  }

  async updateCategory(id: number, name: string, description: string): Promise<BidCategory> {
    const existingCategory = await this.bidCategoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }
    const code = name.toLowerCase().replace(/\s+/g, '_');
    const updatedCategory = new BidCategory({ id, name, description, code });
    return await this.bidCategoryRepository.update(updatedCategory);
  }

  async deleteCategory(id: number): Promise<boolean> {
    return await this.bidCategoryRepository.delete(id);
  }
}
