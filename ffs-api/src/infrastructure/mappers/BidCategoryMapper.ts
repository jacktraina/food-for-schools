import { BidCategory } from '../../domain/interfaces/BidCategories/BidCategory';

export class BidCategoryMapper {
  static toPrisma(entity: BidCategory) {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDomain(prismaModel: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): BidCategory {
    return new BidCategory({
      id: prismaModel.id,
      code: prismaModel.code,
      name: prismaModel.name,
      description: prismaModel.description ?? undefined,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    });
  }
}
