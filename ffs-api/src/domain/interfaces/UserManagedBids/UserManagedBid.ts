import { User } from '../users/User';
import { Bid } from '../Bids/Bid';

export interface IUserManagedBidProps {
  userId: number;
  bidId: number;
  user?: User;
  bid?: Bid;
}

export class UserManagedBid {
  userId: number;
  bidId: number;
  user?: User;
  bid?: Bid;

  constructor({ userId, bidId, user, bid }: IUserManagedBidProps) {
    this.userId = userId;
    this.bidId = bidId;
    this.user = user;
    this.bid = bid;
  }
}
