import { inject, injectable } from 'inversify';
import { IBidService } from '../contracts/IBidService';
import { IBidRepository } from '../../domain/interfaces/Bids/IBidRepository';
import { Bid } from '../../domain/interfaces/Bids/Bid';
import { NotFoundError } from '../../domain/core/errors/NotFoundError';
import { BidDetailsResponse, BidApprovals } from '../../interfaces/responses/bids/BidDetailsResponse';
import TYPES from '../../shared/dependencyInjection/types';

@injectable()
export class BidService implements IBidService {
  constructor(
    @inject(TYPES.IBidRepository) private bidRepository: IBidRepository
  ) {}

  async createBid(bidData: {
    name: string;
    note?: string;
    bidYear: string;
    categoryId?: number;
    status: string;
    awardType?: string;
    startDate?: Date;
    endDate?: Date;
    anticipatedOpeningDate?: Date;
    awardDate?: Date;
    userId?: number;
    description?: string;
    estimatedValue?: string;
    cooperativeId?: number;
    districtId?: number;

  }): Promise<Bid> {
    Bid.validateName(bidData.name);

    Bid.validateStatus(bidData.status);

    const bid = new Bid({
      id: 0,
      name: bidData.name,
      note: bidData.note,
      bidYear: bidData.bidYear,
      categoryId: bidData.categoryId,
      status: bidData.status,
      awardType: bidData.awardType,
      startDate: bidData.startDate,
      endDate: bidData.endDate,
      anticipatedOpeningDate: bidData.anticipatedOpeningDate,
      awardDate: bidData.awardDate,
      userId: bidData.userId,
      description: bidData.description,
      estimatedValue: bidData.estimatedValue,
      cooperativeId: bidData.cooperativeId,
      districtId: bidData.districtId
    });

    return await this.bidRepository.create(bid);
  }

  async getBidById(id: number): Promise<Bid> {
    const bid = await this.bidRepository.findById(id);
    if (!bid) {
      throw new NotFoundError('Bid');
    }
    return bid;
  }

  async getBidDetailsById(id: number): Promise<BidDetailsResponse> {
    const bid = await this.getBidById(id);
    
    const approvals: BidApprovals = this.computeBidApprovals(bid);
    
    const releaseDate = this.computeReleaseDate(bid);
    
    return {
      id: bid.id,
      code: bid.code,
      name: bid.name,
      note: bid.note,
      bidYear: bid.bidYear,
      categoryId: bid.categoryId,
      status: bid.status,
      awardType: bid.awardType,
      startDate: bid.startDate,
      endDate: bid.endDate,
      anticipatedOpeningDate: bid.anticipatedOpeningDate,
      awardDate: bid.awardDate,
      releaseDate: releaseDate,
      userId: bid.userId,
      bidManagerId: bid.userId?.toString() || null,
      description: bid.description,
      estimatedValue: bid.estimatedValue,
      cooperativeId: bid.cooperativeId,
      districtId: bid.districtId,
      schoolId: bid.schoolId,
      isDeleted: bid.isDeleted,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      approvals: approvals
    };
  }

  private computeBidApprovals(bid: Bid): BidApprovals {
    const isAwarded = bid.status === 'Awarded';
    const isReleased = bid.status === 'Released' || bid.status === 'Opened' || isAwarded;
    
    return {
      termsAndConditions: isAwarded ? 'Approved' : isReleased ? 'Pending Approval' : 'Not Started',
      requiredForms: isAwarded ? 'Approved' : isReleased ? 'Pending Approval' : 'Not Started',
      bidItems: isAwarded ? 'Approved' : isReleased ? 'Pending Approval' : 'Not Started',
      participatingDistricts: isAwarded ? 'Approved' : isReleased ? 'Pending Approval' : 'Not Started'
    };
  }

  private computeReleaseDate(bid: Bid): Date | null {
    if (bid.status === 'Released' || bid.status === 'Opened' || bid.status === 'Awarded') {
      return bid.startDate || bid.anticipatedOpeningDate || bid.createdAt;
    }
    return null;
  }

  async getAllBids(): Promise<Bid[]> {
    return await this.bidRepository.findAll();
  }

  async getBidsForUser(user: { cooperativeId?: number | null; districtId?: number | null }): Promise<Bid[]> {
    return await this.bidRepository.findByScope({
      cooperativeId: user.cooperativeId || undefined,
      districtId: user.districtId || undefined,
    });
  }

  async getBidsForBidManager(bidManagerId: number): Promise<Bid[]> {
    return await this.bidRepository.findByBidManager(bidManagerId);
  }

  async getBidsByDistrictId(districtId: number): Promise<Bid[]> {
    return await this.bidRepository.findByDistrictId(districtId);
  }

  async getBidsByCooperativeId(cooperativeId: number): Promise<Bid[]> {
    return await this.bidRepository.findByCooperativeId(cooperativeId);
  }

  async getPaginatedBids(params: {
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
    return await this.bidRepository.findPaginated(params);
  }

  async updateBid(id: number, bidData: {
    name?: string;
    note?: string;
    bidYear?: string;
    categoryId?: number;
    status?: string;
    awardType?: string;
    startDate?: Date;
    endDate?: Date;
    anticipatedOpeningDate?: Date;
    awardDate?: Date;
    userId?: number;
    description?: string;
    estimatedValue?: string;
    cooperativeId?: number;
    districtId?: number;

  }): Promise<Bid> {
    const existingBid = await this.getBidById(id);

    if (bidData.name !== undefined) {
      Bid.validateName(bidData.name);
      existingBid.name = bidData.name;
    }
    if (bidData.note !== undefined) {
      existingBid.note = bidData.note;
    }
    if (bidData.bidYear !== undefined) {

      existingBid.bidYear = bidData.bidYear;
    }
    if (bidData.categoryId !== undefined) {
      existingBid.categoryId = bidData.categoryId;
    }
    if (bidData.status !== undefined) {
      Bid.validateStatus(bidData.status);
      existingBid.status = bidData.status;
    }
    if (bidData.awardType !== undefined) {
      existingBid.awardType = bidData.awardType;
    }
    if (bidData.startDate !== undefined) {
      existingBid.startDate = bidData.startDate;
    }
    if (bidData.endDate !== undefined) {
      existingBid.endDate = bidData.endDate;
    }
    if (bidData.anticipatedOpeningDate !== undefined) {
      existingBid.anticipatedOpeningDate = bidData.anticipatedOpeningDate;
    }
    if (bidData.awardDate !== undefined) {
      existingBid.awardDate = bidData.awardDate;
    }
    if (bidData.userId !== undefined) {
      existingBid.userId = bidData.userId;
    }
    if (bidData.description !== undefined) {
      existingBid.description = bidData.description;
    }
    if (bidData.estimatedValue !== undefined) {
      existingBid.estimatedValue = bidData.estimatedValue;
    }
    if (bidData.cooperativeId !== undefined) {
      existingBid.cooperativeId = bidData.cooperativeId;
    }
    if (bidData.districtId !== undefined) {
      existingBid.districtId = bidData.districtId;
    }

    existingBid.updatedAt = new Date();

    const updatedBid = await this.bidRepository.update(existingBid);
    if (!updatedBid) {
      throw new Error('Failed to update bid');
    }
    return updatedBid;
  }

  async deleteBid(id: number): Promise<void> {
    const bid = await this.getBidById(id);
    await this.bidRepository.softDelete(bid.id!);
  }
}
