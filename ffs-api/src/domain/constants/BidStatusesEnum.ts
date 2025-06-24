export enum BidStatusesEnum {
  Archived = "Archived",
  Awarded = "Awarded",
  Canceled = "Canceled",
  Draft = "Draft",
  InProcess = "In Process",
  Opened = "Opened",
  PendingApproval = "Pending Approval",
  Released = "Released",
  UnderReview = "Under Review"
}

export function getActiveBidStatuses(): BidStatusesEnum[] {
  return [
    BidStatusesEnum.InProcess,
    BidStatusesEnum.Opened,
    BidStatusesEnum.PendingApproval,
    BidStatusesEnum.UnderReview
  ];
}
