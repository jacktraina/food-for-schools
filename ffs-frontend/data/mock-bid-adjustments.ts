export type AdjustmentType = "Price Change" | "Code Change" | "Item Change" | "Vendor Change" | "Other"

export interface BidAdjustment {
  id: string
  bidId: string
  itemAffected: string
  lisdnaCode?: string
  adjustmentType: AdjustmentType
  effectiveDate: Date
  note: string
  fileUrl?: string
  fileName?: string
  enteredBy: string
  enteredDate: Date
}

export const mockBidAdjustments: BidAdjustment[] = [
  {
    id: "adj-001",
    bidId: "BID-2023-001",
    itemAffected: "Whole Grain Bread",
    lisdnaCode: "BR-001",
    adjustmentType: "Price Change",
    effectiveDate: new Date(2023, 9, 15),
    note: "Price increase of $0.25 per unit due to supply chain issues",
    fileUrl: "/documents/price-change-notice.pdf",
    fileName: "price-change-notice.pdf",
    enteredBy: "user-001",
    enteredDate: new Date(2023, 9, 10),
  },
  {
    id: "adj-002",
    bidId: "BID-2023-001",
    itemAffected: "Chicken Patties",
    lisdnaCode: "MT-045",
    adjustmentType: "Vendor Change",
    effectiveDate: new Date(2023, 10, 1),
    note: "Vendor changed from ABC Foods to XYZ Distributors",
    enteredBy: "user-002",
    enteredDate: new Date(2023, 9, 25),
  },
  {
    id: "adj-003",
    bidId: "BID-2023-002",
    itemAffected: "Apple Juice",
    lisdnaCode: "BV-012",
    adjustmentType: "Code Change",
    effectiveDate: new Date(2023, 11, 5),
    note: "LISNDA code updated from BV-010 to BV-012",
    enteredBy: "user-001",
    enteredDate: new Date(2023, 10, 30),
  },
  {
    id: "adj-004",
    bidId: "BID-2023-003",
    itemAffected: "Whole Wheat Pasta",
    lisdnaCode: "GR-023",
    adjustmentType: "Item Change",
    effectiveDate: new Date(2023, 8, 20),
    note: "Product reformulated to meet new whole grain requirements",
    fileUrl: "/documents/product-spec-update.pdf",
    fileName: "product-spec-update.pdf",
    enteredBy: "user-003",
    enteredDate: new Date(2023, 8, 15),
  },
  {
    id: "adj-005",
    bidId: "BID-2023-004",
    itemAffected: "Fresh Apples",
    lisdnaCode: "FR-001",
    adjustmentType: "Other",
    effectiveDate: new Date(2023, 7, 10),
    note: "Seasonal availability change - switching from Gala to Fuji variety",
    enteredBy: "user-002",
    enteredDate: new Date(2023, 7, 5),
  },
]
