export interface PaginationResponse {
  pagination: PaginationResponse_Item
}

export interface PaginationResponse_Item {
  total: number
  page: number
  limit: number
  totalPages: number
}
