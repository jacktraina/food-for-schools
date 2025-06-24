/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, injectable } from "inversify";
import { IDatabaseService } from "../../application/contracts/IDatabaseService";
import TYPES from "../../shared/dependencyInjection/types";
import { PrismaClient } from "@prisma/client";
import { IBidRepository } from "../../domain/interfaces/Bids/IBidRepository";
import { Bid } from "../../domain/interfaces/Bids/Bid";
import {
  getActiveBidStatuses,
} from "../../domain/constants/BidStatusesEnum";

@injectable()
export class BidRepository implements IBidRepository {
  private bidModel: PrismaClient["bid"];
  private readonly nonDeletedFilter = {
    isDeleted: false,
    district: {
      isDeleted: false,
    },
  };

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.bidModel = database.getClient().bid;
  }

  async countActive(): Promise<number> {
    return this.bidModel.count({
      where: this.nonDeletedFilter,
    });
  }

  async countActiveSince(date: Date): Promise<number> {
    return this.bidModel.count({
      where: {
        ...this.nonDeletedFilter,
        createdAt: {
          gte: date,
        },
        status: {
          in: getActiveBidStatuses(),
        },
      },
    });
  }

  async countActiveByOrganization(params: {
    cooperativeId?: number;
    districtId?: number;
  }): Promise<number> {
    const { cooperativeId, districtId } = params;

    const where: any = {
      isDeleted: false,
      status: {
        in: getActiveBidStatuses(),
      },
    };

    if (cooperativeId && districtId) {
      where.OR = [
        { cooperativeId },
        { districtId, district: { isDeleted: false } },
      ];
    } else {
      if (cooperativeId) {
        where.cooperativeId = cooperativeId;
      }
      if (districtId) {
        where.districtId = districtId;
        where.district = { isDeleted: false };
      }
    }

    return this.bidModel.count({ where });
  }

  async countActiveSinceByOrganization(
    date: Date,
    params: { cooperativeId?: number; districtId?: number }
  ): Promise<number> {
    const { cooperativeId, districtId } = params;

    const where: any = {
      isDeleted: false,
      status: {
        in: getActiveBidStatuses(),
      },
      createdAt: {
        gte: date,
      },
    };

    if (cooperativeId && districtId) {
      where.OR = [
        { cooperativeId },
        { districtId, district: { isDeleted: false } },
      ];
    } else {
      if (cooperativeId) {
        where.cooperativeId = cooperativeId;
      }
      if (districtId) {
        where.districtId = districtId;
        where.district = { isDeleted: false };
      }
    }

    return this.bidModel.count({ where });
  }

  async create(bid: Bid): Promise<Bid> {
    const createdBid = await this.bidModel.create({
      data: {
        code: bid.code || `BID-${Date.now()}`,
        name: bid.name || "",
        note: bid.note,
        bidYear: bid.bidYear || "",
        categoryId: bid.categoryId,
        status: bid.status || "In Process",
        awardType: bid.awardType,
        startDate: bid.startDate,
        endDate: bid.endDate,
        anticipatedOpeningDate: bid.anticipatedOpeningDate,
        awardDate: bid.awardDate,
        userId: bid.userId,
        description: bid.description,
        estimatedValue: bid.estimatedValue,
        cooperativeId: bid.cooperativeId,
        districtId: bid.districtId,
        isDeleted: bid.isDeleted,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return new Bid({
      id: createdBid.id,
      code: createdBid.code ?? undefined,
      name: createdBid.name,
      note: createdBid.note ?? undefined,
      bidYear: createdBid.bidYear ?? undefined,
      categoryId: createdBid.categoryId ?? undefined,
      status: createdBid.status,
      awardType: createdBid.awardType ?? undefined,
      startDate: createdBid.startDate ?? undefined,
      endDate: createdBid.endDate ?? undefined,
      anticipatedOpeningDate: createdBid.anticipatedOpeningDate ?? undefined,
      awardDate: createdBid.awardDate ?? undefined,
      userId: createdBid.userId ?? undefined,
      description: createdBid.description ?? undefined,
      estimatedValue: createdBid.estimatedValue ?? undefined,
      cooperativeId: createdBid.cooperativeId ?? undefined,
      districtId: createdBid.districtId ?? undefined,
      isDeleted: createdBid.isDeleted ?? false,
      createdAt: createdBid.createdAt,
      updatedAt: createdBid.updatedAt,
    });
  }

  async findById(id: number): Promise<Bid | null> {
    const bid = await this.bidModel.findUnique({
      where: {
        id,
        ...this.nonDeletedFilter,
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!bid) return null;

    return new Bid({
      id: bid.id,
      code: bid.code ?? undefined,
      name: bid.name,
      note: bid.note ?? undefined,
      bidYear: bid.bidYear ?? undefined,
      categoryId: bid.categoryId ?? undefined,
      status: bid.status,
      awardType: bid.awardType ?? undefined,
      startDate: bid.startDate ?? undefined,
      endDate: bid.endDate ?? undefined,
      anticipatedOpeningDate: bid.anticipatedOpeningDate ?? undefined,
      awardDate: bid.awardDate ?? undefined,
      userId: bid.userId ?? undefined,
      description: bid.description ?? undefined,
      estimatedValue: bid.estimatedValue ?? undefined,
      cooperativeId: bid.cooperativeId ?? undefined,
      districtId: bid.districtId ?? undefined,
      isDeleted: bid.isDeleted ?? false,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
    });
  }

  async findAll(): Promise<Bid[]> {
    const bids = await this.bidModel.findMany({
      where: this.nonDeletedFilter,
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return bids.map(
      (bid) =>
        new Bid({
          id: bid.id,
          code: bid.code ?? undefined,
          name: bid.name,
          note: bid.note ?? undefined,
          bidYear: bid.bidYear ?? undefined,
          categoryId: bid.categoryId ?? undefined,
          status: bid.status,
          awardType: bid.awardType ?? undefined,
          startDate: bid.startDate ?? undefined,
          endDate: bid.endDate ?? undefined,
          anticipatedOpeningDate: bid.anticipatedOpeningDate ?? undefined,
          awardDate: bid.awardDate ?? undefined,
          userId: bid.userId ?? undefined,
          description: bid.description ?? undefined,
          estimatedValue: bid.estimatedValue ?? undefined,
          cooperativeId: bid.cooperativeId ?? undefined,
          districtId: bid.districtId ?? undefined,
          isDeleted: bid.isDeleted ?? false,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        })
    );
  }

  async findByScope(params: {
    cooperativeId?: number;
    districtId?: number;
    schoolId?: number;
  }): Promise<Bid[]> {
    const { cooperativeId, districtId, schoolId } = params;

    const where: any = {
      ...this.nonDeletedFilter,
    };

    if (cooperativeId) {
      where.cooperativeId = cooperativeId;
    } else if (districtId) {
      where.districtId = districtId;
    }

    if (schoolId) {
      where.schoolId = schoolId;
    }

    const bids = await this.bidModel.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return bids.map(
      (bid) =>
        new Bid({
          id: bid.id,
          code: bid.code ?? undefined,
          name: bid.name,
          note: bid.note ?? undefined,
          bidYear: bid.bidYear ?? undefined,
          categoryId: bid.categoryId ?? undefined,
          status: bid.status,
          awardType: bid.awardType ?? undefined,
          startDate: bid.startDate ?? undefined,
          endDate: bid.endDate ?? undefined,
          anticipatedOpeningDate: bid.anticipatedOpeningDate ?? undefined,
          awardDate: bid.awardDate ?? undefined,
          userId: bid.userId ?? undefined,
          description: bid.description ?? undefined,
          estimatedValue: bid.estimatedValue ?? undefined,
          cooperativeId: bid.cooperativeId ?? undefined,
          districtId: bid.districtId ?? undefined,
          isDeleted: bid.isDeleted ?? false,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        })
    );
  }

  async findByBidManager(bidManagerId: number): Promise<Bid[]> {
    const bids = await this.bidModel.findMany({
      where: {
        ...this.nonDeletedFilter,
        OR: [
          { userId: bidManagerId },
          { userManagedBids: { some: { userId: bidManagerId } } },
        ],
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return bids.map(
      (bid) =>
        new Bid({
          id: bid.id,
          code: bid.code ?? undefined,
          name: bid.name,
          note: bid.note ?? undefined,
          bidYear: bid.bidYear ?? undefined,
          categoryId: bid.categoryId ?? undefined,
          status: bid.status,
          awardType: bid.awardType ?? undefined,
          startDate: bid.startDate ?? undefined,
          endDate: bid.endDate ?? undefined,
          anticipatedOpeningDate: bid.anticipatedOpeningDate ?? undefined,
          awardDate: bid.awardDate ?? undefined,
          userId: bid.userId ?? undefined,
          description: bid.description ?? undefined,
          estimatedValue: bid.estimatedValue ?? undefined,
          cooperativeId: bid.cooperativeId ?? undefined,
          districtId: bid.districtId ?? undefined,
          isDeleted: bid.isDeleted ?? false,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        })
    );
  }

  async findByDistrictId(districtId: number): Promise<Bid[]> {
    const bids = await this.bidModel.findMany({
      where: {
        ...this.nonDeletedFilter,
        districtId: districtId,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return bids.map(
      (bid) =>
        new Bid({
          id: bid.id,
          code: bid.code ?? undefined,
          name: bid.name,
          note: bid.note ?? undefined,
          bidYear: bid.bidYear ?? undefined,
          categoryId: bid.categoryId ?? undefined,
          status: bid.status,
          awardType: bid.awardType ?? undefined,
          startDate: bid.startDate ?? undefined,
          endDate: bid.endDate ?? undefined,
          anticipatedOpeningDate: bid.anticipatedOpeningDate ?? undefined,
          awardDate: bid.awardDate ?? undefined,
          userId: bid.userId ?? undefined,
          description: bid.description ?? undefined,
          estimatedValue: bid.estimatedValue ?? undefined,
          cooperativeId: bid.cooperativeId ?? undefined,
          districtId: bid.districtId ?? undefined,
          isDeleted: bid.isDeleted ?? false,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        })
    );
  }

  async findByCooperativeId(cooperativeId: number): Promise<Bid[]> {
    const bids = await this.bidModel.findMany({
      where: {
        ...this.nonDeletedFilter,
        cooperativeId: cooperativeId,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return bids.map(
      (bid) =>
        new Bid({
          id: bid.id,
          code: bid.code ?? undefined,
          name: bid.name,
          note: bid.note ?? undefined,
          bidYear: bid.bidYear ?? undefined,
          categoryId: bid.categoryId ?? undefined,
          status: bid.status,
          awardType: bid.awardType ?? undefined,
          startDate: bid.startDate ?? undefined,
          endDate: bid.endDate ?? undefined,
          anticipatedOpeningDate: bid.anticipatedOpeningDate ?? undefined,
          awardDate: bid.awardDate ?? undefined,
          userId: bid.userId ?? undefined,
          description: bid.description ?? undefined,
          estimatedValue: bid.estimatedValue ?? undefined,
          cooperativeId: bid.cooperativeId ?? undefined,
          districtId: bid.districtId ?? undefined,
          isDeleted: bid.isDeleted ?? false,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        })
    );
  }

  async update(bid: Bid): Promise<Bid | null> {
    const updatedBid = await this.bidModel.update({
      where: { id: bid.id },
      data: {
        code: bid.code || "",
        name: bid.name || "",
        note: bid.note,
        bidYear: bid.bidYear || "",
        categoryId: bid.categoryId,
        status: bid.status || "In Process",
        awardType: bid.awardType,
        startDate: bid.startDate,
        endDate: bid.endDate,
        anticipatedOpeningDate: bid.anticipatedOpeningDate,
        awardDate: bid.awardDate,
        userId: bid.userId,
        description: bid.description,
        estimatedValue: bid.estimatedValue,
        cooperativeId: bid.cooperativeId,
        districtId: bid.districtId,
        isDeleted: bid.isDeleted,
        updatedAt: bid.updatedAt,
      },
      select: {
        id: true,
        code: true,
        name: true,
        note: true,
        bidYear: true,
        categoryId: true,
        status: true,
        awardType: true,
        startDate: true,
        endDate: true,
        anticipatedOpeningDate: true,
        awardDate: true,
        userId: true,
        description: true,
        estimatedValue: true,
        cooperativeId: true,
        districtId: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return new Bid({
      id: updatedBid.id,
      code: updatedBid.code ?? undefined,
      name: updatedBid.name,
      note: updatedBid.note ?? undefined,
      bidYear: updatedBid.bidYear ?? undefined,
      categoryId: updatedBid.categoryId ?? undefined,
      status: updatedBid.status,
      awardType: updatedBid.awardType ?? undefined,
      startDate: updatedBid.startDate ?? undefined,
      endDate: updatedBid.endDate ?? undefined,
      anticipatedOpeningDate: updatedBid.anticipatedOpeningDate ?? undefined,
      awardDate: updatedBid.awardDate ?? undefined,
      userId: updatedBid.userId ?? undefined,
      description: updatedBid.description ?? undefined,
      estimatedValue: updatedBid.estimatedValue ?? undefined,
      cooperativeId: updatedBid.cooperativeId ?? undefined,
      districtId: updatedBid.districtId ?? undefined,
      isDeleted: updatedBid.isDeleted ?? false,
      createdAt: updatedBid.createdAt,
      updatedAt: updatedBid.updatedAt,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.bidModel.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    bidYear?: string;
    status?: string;
    awardType?: string;
    userId?: number;
    districtId?: number;
    cooperativeId?: number;
  }): Promise<{ bids: Bid[]; total: number }> {
    const {
      page,
      limit,
      search,
      bidYear,
      status,
      awardType,
      userId,
      districtId,
      cooperativeId,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false, // Explicitly set here instead of using nonDeletedFilter
    };

    // Search functionality
    if (search) {
      const searchAsNumber = parseInt(search);
      where.OR = [
        ...(isNaN(searchAsNumber) ? [] : [{ id: { equals: searchAsNumber } }]),
        { name: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Filter by cooperativeId and/or districtId
    if (cooperativeId && districtId) {
      where.OR = [
        { cooperativeId },
        { districtId, district: { isDeleted: false } },
      ];
    } else {
      if (cooperativeId) {
        where.cooperativeId = cooperativeId;
      }
      if (districtId) {
        where.districtId = districtId;
        where.district = { isDeleted: false };
      }
    }

    // Other filters
    if (bidYear) where.bidYear = bidYear;
    if (status) where.status = status;
    if (awardType) where.awardType = awardType;

    // User filter with proper handling of existing OR conditions
    if (userId) {
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { userId }];
        delete where.OR;
      } else {
        where.userId = userId;
      }
    }

    console.log("Final where clause:", where);

    const [bids, total] = await Promise.all([
      this.bidModel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: {
          // Using include instead of select for better readability
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          district: {
            select: {
              isDeleted: true,
            },
          },
        },
      }),
      this.bidModel.count({ where }),
    ]);

    return {
      bids: bids.map(
        (bid) =>
          new Bid({
            id: bid.id,
            code: bid.code ?? undefined,
            name: bid.name,
            note: bid.note ?? undefined,
            bidYear: bid.bidYear ?? undefined,
            categoryId: bid.categoryId ?? undefined,
            status: bid.status,
            awardType: bid.awardType ?? undefined,
            startDate: bid.startDate ?? undefined,
            endDate: bid.endDate ?? undefined,
            anticipatedOpeningDate: bid.anticipatedOpeningDate ?? undefined,
            awardDate: bid.awardDate ?? undefined,
            userId: bid.userId ?? undefined,
            description: bid.description ?? undefined,
            estimatedValue: bid.estimatedValue ?? undefined,
            cooperativeId: bid.cooperativeId ?? undefined,
            districtId: bid.districtId ?? undefined,
            isDeleted: bid.isDeleted ?? false,
            createdAt: bid.createdAt,
            updatedAt: bid.updatedAt,
          })
      ),
      total,
    };
  }

  async softDelete(id: number): Promise<void> {
    try {
      await this.bidModel.update({
        where: { id },
        data: { isDeleted: true },
      });
    } catch (error) {
      console.error("Error soft deleting bid:", error);
      throw error;
    }
  }
}
