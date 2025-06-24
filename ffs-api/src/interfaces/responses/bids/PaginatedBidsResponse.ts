import { BidListItem } from './BidListResponse';
import { PaginationResponse } from '../base/PaginationResponse';

export interface PaginatedBidsResponse extends PaginationResponse {
  bids: BidListItem[];
}
