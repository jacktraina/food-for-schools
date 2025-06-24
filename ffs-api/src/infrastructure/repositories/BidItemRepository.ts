import { inject, injectable } from "inversify";
import { IBidItemRepository } from "../../domain/interfaces/BidItems/IBidItemRepository";
import { BidItem } from "../../domain/interfaces/BidItems/BidItem";
import { Bid } from "../../domain/interfaces/Bids/Bid";
import { IDatabaseService } from "../../application/contracts/IDatabaseService";
import TYPES from "../../shared/dependencyInjection/types";
import { PrismaClient } from "@prisma/client";



const nonDeletedFilter = {
  bid: {
    isDeleted: false,
    district: {
      isDeleted: false,
    },
  },
};

@injectable()
export class BidItemRepository implements IBidItemRepository {
  private prismaClient: PrismaClient;

  constructor(@inject(TYPES.IDatabaseService) private databaseService: IDatabaseService) {
    this.prismaClient = this.databaseService.getClient();
  }

  async findAll(): Promise<BidItem[]> {
    const bidItems = await this.prismaClient.bidItems.findMany({
      where: {
        ...nonDeletedFilter,
        isDeleted: false,
      },
      include: {
        bid: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return bidItems.map(
      (item) =>
        new BidItem({
          id: item.id,
          bidId: item.bidId,
          itemName: item.itemName,
          acceptableBrands: item.acceptableBrands,
          awardGroup: item.awardGroup,
          diversion: item.diversion,
          status: item.status,
          projection: item.projection ? Number(item.projection) : null,
          projectionUnit: item.projectionUnit,
          minProjection: item.minProjection ? Number(item.minProjection) : null,
          totalBidUnits: item.totalBidUnits ? Number(item.totalBidUnits) : null,
          bidUnit: item.bidUnit,
          bidUnitProjUnit: item.bidUnitProjUnit ? Number(item.bidUnitProjUnit) : null,
          percentDistrictsUsing: item.percentDistrictsUsing
            ? Number(item.percentDistrictsUsing)
            : null,
          createdAt: item.createdAt || undefined,
          updatedAt: item.updatedAt || undefined,
          isDeleted: item.isDeleted || false,
          bid: item.bid ? new Bid({
            id: item.bid.id,
            name: item.bid.name,
            code: item.bid.code,
            note: item.bid.note,
            bidYear: item.bid.bidYear,
            categoryId: item.bid.categoryId,
            status: item.bid.status,
            awardType: item.bid.awardType,
            startDate: item.bid.startDate,
            endDate: item.bid.endDate,
            anticipatedOpeningDate: item.bid.anticipatedOpeningDate,
            awardDate: item.bid.awardDate,
            userId: item.bid.userId,
            description: item.bid.description,
            estimatedValue: item.bid.estimatedValue,
            cooperativeId: item.bid.cooperativeId,
            districtId: item.bid.districtId,
            schoolId: item.bid.schoolId,
            isDeleted: item.bid.isDeleted,
            createdAt: item.bid.createdAt,
            updatedAt: item.bid.updatedAt,
          }) : undefined,
        })
    );
  }

  async findByBidId(bidId: number): Promise<BidItem[]> {
    const bidItems = await this.prismaClient.bidItems.findMany({
      where: {
        bidId,
        ...nonDeletedFilter,
        isDeleted: false,
      },
      include: {
        bid: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return bidItems.map(
      (item) =>
        new BidItem({
          id: item.id,
          bidId: item.bidId,
          itemName: item.itemName,
          acceptableBrands: item.acceptableBrands,
          awardGroup: item.awardGroup,
          diversion: item.diversion,
          status: item.status,
          projection: item.projection ? Number(item.projection) : null,
          projectionUnit: item.projectionUnit,
          minProjection: item.minProjection ? Number(item.minProjection) : null,
          totalBidUnits: item.totalBidUnits ? Number(item.totalBidUnits) : null,
          bidUnit: item.bidUnit,
          bidUnitProjUnit: item.bidUnitProjUnit ? Number(item.bidUnitProjUnit) : null,
          percentDistrictsUsing: item.percentDistrictsUsing
            ? Number(item.percentDistrictsUsing)
            : null,
          createdAt: item.createdAt || undefined,
          updatedAt: item.updatedAt || undefined,
          isDeleted: item.isDeleted || false,
          bid: item.bid ? new Bid({
            id: item.bid.id,
            name: item.bid.name,
            code: item.bid.code,
            note: item.bid.note,
            bidYear: item.bid.bidYear,
            categoryId: item.bid.categoryId,
            status: item.bid.status,
            awardType: item.bid.awardType,
            startDate: item.bid.startDate,
            endDate: item.bid.endDate,
            anticipatedOpeningDate: item.bid.anticipatedOpeningDate,
            awardDate: item.bid.awardDate,
            userId: item.bid.userId,
            description: item.bid.description,
            estimatedValue: item.bid.estimatedValue,
            cooperativeId: item.bid.cooperativeId,
            districtId: item.bid.districtId,
            schoolId: item.bid.schoolId,
            isDeleted: item.bid.isDeleted,
            createdAt: item.bid.createdAt,
            updatedAt: item.bid.updatedAt,
          }) : undefined,
        })
    );
  }

  async findById(id: number): Promise<BidItem | null> {
    const bidItem = await this.prismaClient.bidItems.findUnique({
      where: {
        id,
        ...nonDeletedFilter,
        isDeleted: false,
      },
      include: {
        bid: true,
      },
    });

    if (!bidItem) {
      return null;
    }

    return new BidItem({
      id: bidItem.id,
      bidId: bidItem.bidId,
      itemName: bidItem.itemName,
      acceptableBrands: bidItem.acceptableBrands,
      awardGroup: bidItem.awardGroup,
      diversion: bidItem.diversion,
      status: bidItem.status,
      projection: bidItem.projection ? Number(bidItem.projection) : null,
      projectionUnit: bidItem.projectionUnit,
      minProjection: bidItem.minProjection ? Number(bidItem.minProjection) : null,
      totalBidUnits: bidItem.totalBidUnits ? Number(bidItem.totalBidUnits) : null,
      bidUnit: bidItem.bidUnit,
      bidUnitProjUnit: bidItem.bidUnitProjUnit ? Number(bidItem.bidUnitProjUnit) : null,
      percentDistrictsUsing: bidItem.percentDistrictsUsing
        ? Number(bidItem.percentDistrictsUsing)
        : null,
      createdAt: bidItem.createdAt || undefined,
      updatedAt: bidItem.updatedAt || undefined,
      isDeleted: bidItem.isDeleted || false,
      bid: bidItem.bid ? new Bid({
        id: bidItem.bid.id,
        name: bidItem.bid.name,
        code: bidItem.bid.code,
        note: bidItem.bid.note,
        bidYear: bidItem.bid.bidYear,
        categoryId: bidItem.bid.categoryId,
        status: bidItem.bid.status,
        awardType: bidItem.bid.awardType,
        startDate: bidItem.bid.startDate,
        endDate: bidItem.bid.endDate,
        anticipatedOpeningDate: bidItem.bid.anticipatedOpeningDate,
        awardDate: bidItem.bid.awardDate,
        userId: bidItem.bid.userId,
        description: bidItem.bid.description,
        estimatedValue: bidItem.bid.estimatedValue,
        cooperativeId: bidItem.bid.cooperativeId,
        districtId: bidItem.bid.districtId,
        schoolId: bidItem.bid.schoolId,
        isDeleted: bidItem.bid.isDeleted,
        createdAt: bidItem.bid.createdAt,
        updatedAt: bidItem.bid.updatedAt,
      }) : undefined,
    });
  }

  async create(bidItem: BidItem): Promise<BidItem> {
    const createdItem = await this.prismaClient.bidItems.create({
      data: {
        bidId: bidItem.bidId,
        itemName: bidItem.itemName,
        acceptableBrands: bidItem.acceptableBrands,
        awardGroup: bidItem.awardGroup,
        diversion: bidItem.diversion,
        status: bidItem.status,
        projection: bidItem.projection,
        projectionUnit: bidItem.projectionUnit,
        minProjection: bidItem.minProjection,
        totalBidUnits: bidItem.totalBidUnits,
        bidUnit: bidItem.bidUnit,
        bidUnitProjUnit: bidItem.bidUnitProjUnit,
        percentDistrictsUsing: bidItem.percentDistrictsUsing,
        isDeleted: false,
      },
      include: {
        bid: true,
      },
    });

    return new BidItem({
      id: createdItem.id,
      bidId: createdItem.bidId,
      itemName: createdItem.itemName,
      acceptableBrands: createdItem.acceptableBrands,
      awardGroup: createdItem.awardGroup,
      diversion: createdItem.diversion,
      status: createdItem.status,
      projection: createdItem.projection ? Number(createdItem.projection) : null,
      projectionUnit: createdItem.projectionUnit,
      minProjection: createdItem.minProjection ? Number(createdItem.minProjection) : null,
      totalBidUnits: createdItem.totalBidUnits ? Number(createdItem.totalBidUnits) : null,
      bidUnit: createdItem.bidUnit,
      bidUnitProjUnit: createdItem.bidUnitProjUnit ? Number(createdItem.bidUnitProjUnit) : null,
      percentDistrictsUsing: createdItem.percentDistrictsUsing
        ? Number(createdItem.percentDistrictsUsing)
        : null,
      createdAt: createdItem.createdAt || undefined,
      updatedAt: createdItem.updatedAt || undefined,
      isDeleted: createdItem.isDeleted || false,
      bid: createdItem.bid ? new Bid({
        id: createdItem.bid.id,
        name: createdItem.bid.name,
        code: createdItem.bid.code,
        note: createdItem.bid.note,
        bidYear: createdItem.bid.bidYear,
        categoryId: createdItem.bid.categoryId,
        status: createdItem.bid.status,
        awardType: createdItem.bid.awardType,
        startDate: createdItem.bid.startDate,
        endDate: createdItem.bid.endDate,
        anticipatedOpeningDate: createdItem.bid.anticipatedOpeningDate,
        awardDate: createdItem.bid.awardDate,
        userId: createdItem.bid.userId,
        description: createdItem.bid.description,
        estimatedValue: createdItem.bid.estimatedValue,
        cooperativeId: createdItem.bid.cooperativeId,
        districtId: createdItem.bid.districtId,
        schoolId: createdItem.bid.schoolId,
        isDeleted: createdItem.bid.isDeleted,
        createdAt: createdItem.bid.createdAt,
        updatedAt: createdItem.bid.updatedAt,
      }) : undefined,
    });
  }

  async update(bidItem: BidItem): Promise<BidItem> {
    const updatedItem = await this.prismaClient.bidItems.update({
      where: { id: bidItem.id },
      data: {
        itemName: bidItem.itemName,
        acceptableBrands: bidItem.acceptableBrands,
        awardGroup: bidItem.awardGroup,
        diversion: bidItem.diversion,
        status: bidItem.status,
        projection: bidItem.projection,
        projectionUnit: bidItem.projectionUnit,
        minProjection: bidItem.minProjection,
        totalBidUnits: bidItem.totalBidUnits,
        bidUnit: bidItem.bidUnit,
        bidUnitProjUnit: bidItem.bidUnitProjUnit,
        percentDistrictsUsing: bidItem.percentDistrictsUsing,
        updatedAt: new Date(),
      },
      include: {
        bid: true,
      },
    });

    return new BidItem({
      id: updatedItem.id,
      bidId: updatedItem.bidId,
      itemName: updatedItem.itemName,
      acceptableBrands: updatedItem.acceptableBrands,
      awardGroup: updatedItem.awardGroup,
      diversion: updatedItem.diversion,
      status: updatedItem.status,
      projection: updatedItem.projection ? Number(updatedItem.projection) : null,
      projectionUnit: updatedItem.projectionUnit,
      minProjection: updatedItem.minProjection ? Number(updatedItem.minProjection) : null,
      totalBidUnits: updatedItem.totalBidUnits ? Number(updatedItem.totalBidUnits) : null,
      bidUnit: updatedItem.bidUnit,
      bidUnitProjUnit: updatedItem.bidUnitProjUnit ? Number(updatedItem.bidUnitProjUnit) : null,
      percentDistrictsUsing: updatedItem.percentDistrictsUsing
        ? Number(updatedItem.percentDistrictsUsing)
        : null,
      createdAt: updatedItem.createdAt || undefined,
      updatedAt: updatedItem.updatedAt || undefined,
      isDeleted: updatedItem.isDeleted || false,
      bid: updatedItem.bid ? new Bid({
        id: updatedItem.bid.id,
        name: updatedItem.bid.name,
        code: updatedItem.bid.code,
        note: updatedItem.bid.note,
        bidYear: updatedItem.bid.bidYear,
        categoryId: updatedItem.bid.categoryId,
        status: updatedItem.bid.status,
        awardType: updatedItem.bid.awardType,
        startDate: updatedItem.bid.startDate,
        endDate: updatedItem.bid.endDate,
        anticipatedOpeningDate: updatedItem.bid.anticipatedOpeningDate,
        awardDate: updatedItem.bid.awardDate,
        userId: updatedItem.bid.userId,
        description: updatedItem.bid.description,
        estimatedValue: updatedItem.bid.estimatedValue,
        cooperativeId: updatedItem.bid.cooperativeId,
        districtId: updatedItem.bid.districtId,
        schoolId: updatedItem.bid.schoolId,
        isDeleted: updatedItem.bid.isDeleted,
        createdAt: updatedItem.bid.createdAt,
        updatedAt: updatedItem.bid.updatedAt,
      }) : undefined,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prismaClient.bidItems.update({
        where: { id },
        data: { isDeleted: true, updatedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }
}
