import { inject, injectable } from 'inversify';
import TYPES from '../../shared/dependencyInjection/types';
import { IUSDANewsService } from '../contracts/IUSDANewsService';
import { IUSDANewsRepository } from '../../domain/interfaces/USDANews/IUSDANewsRepository';
import { USDANews } from '../../domain/interfaces/USDANews/USDANews';

@injectable()
export class USDANewsService implements IUSDANewsService {
  constructor(
    @inject(TYPES.IUSDANewsRepository) private usdaNewsRepository: IUSDANewsRepository
  ) {}

  async getLatestNews(): Promise<USDANews[]> {
    try {
      const news = await this.usdaNewsRepository.getLatestNews();
      return news;
    } catch (error) {
      console.error('Error in USDANewsService.getLatestNews:', error);
      return [];
    }
  }
}
