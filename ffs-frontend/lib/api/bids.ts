import apiClient from './client'

export interface Bid {
  id: number
  number?: string
  name: string
  note?: string
  bidYear: string
  categoryId?: number
  category?: string
  status: string
  awardType?: string
  startDate?: string
  endDate?: string
  anticipatedOpeningDate?: string
  awardDate?: string
  userId?: number
  bidManagerId?: string
  description?: string
  estimatedValue?: string
  organizationId?: number
  organizationType?: string
  createdAt?: string
  updatedAt?: string
}

export async function getAllBids(): Promise<Bid[]> {
  try {
    const response = await apiClient.get('/api/bids')
    return response.data.map((bid: any) => ({
      ...bid,
      bidManagerId: bid.userId
    }))
  } catch (error) {
    console.error('Failed to fetch bids from API:', error)
    return []
  }
}

export async function getBidById(id: string): Promise<Bid | null> {
  try {
    const response = await apiClient.get(`/api/bids/${id}`)
    const bid = response.data
    return {
      ...bid,
      bidManagerId: bid.userId
    }
  } catch (error) {
    console.error('Failed to fetch bid from API:', error)
    return null
  }
}

export async function createBid(bidData: any): Promise<Bid> {
  try {
    const transformedData = {
      ...bidData,
      userId: bidData.bidManagerId ? parseInt(bidData.bidManagerId, 10) : bidData.userId,
      bidManagerId: undefined
    }
    
    const response = await apiClient.post('/api/bids', transformedData)
    const bid = response.data
    return {
      ...bid,
      bidManagerId: bid.userId
    }
  } catch (error) {
    console.error('Failed to create bid:', error)
    throw error
  }
}

export async function updateBid(id: string, bidData: Partial<Bid>): Promise<Bid> {
  try {
    const transformedData = {
      ...bidData,
      userId: bidData.bidManagerId ? parseInt(bidData.bidManagerId, 10) : bidData.userId,
      bidManagerId: undefined
    }
    
    const response = await apiClient.patch(`/api/bids/${id}`, transformedData)
    const bid = response.data
    return {
      ...bid,
      bidManagerId: bid.userId
    }
  } catch (error) {
    console.error('Failed to update bid:', error)
    throw error
  }
}

export async function deleteBid(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/bids/${id}`)
  } catch (error) {
    console.error('Failed to delete bid:', error)
    throw error
  }
}

export async function getBidsByDistrict(districtId: number): Promise<Bid[]> {
  try {
    const response = await apiClient.get(`/bids/district/${districtId}`)
    return response.data.map((bid: any) => ({
      ...bid,
      bidManagerId: bid.userId
    }))
  } catch (error) {
    console.error('Failed to fetch bids by district from API:', error)
    return []
  }
}

export async function getBidsByCooperative(cooperativeId: number): Promise<Bid[]> {
  try {
    const response = await apiClient.get(`/bids/cooperative/${cooperativeId}`)
    return response.data.map((bid: any) => ({
      ...bid,
      bidManagerId: bid.userId
    }))
  } catch (error) {
    console.error('Failed to fetch bids by cooperative from API:', error)
    return []
  }
}

export interface PaginatedBidsParams {
  page?: number
  limit?: number
  search?: string
  bidYear?: string
  status?: string
  awardType?: string
  myBids?: boolean
  districtId?: number
  cooperativeId?: number
}

export interface PaginatedBidsResponse {
  bids: Bid[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getPaginatedBids(params: PaginatedBidsParams = {}): Promise<PaginatedBidsResponse> {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.bidYear) queryParams.append('bidYear', params.bidYear)
    if (params.status) queryParams.append('status', params.status)
    if (params.awardType) queryParams.append('awardType', params.awardType)
    if (params.myBids) queryParams.append('myBids', 'true')
    if (params.districtId) queryParams.append('districtId', params.districtId.toString())
    if (params.cooperativeId) queryParams.append('cooperativeId', params.cooperativeId.toString())

    const response = await apiClient.get(`/bids/paginated?${queryParams.toString()}`)
    
    return {
      bids: response.data.bids.map((bid: any) => ({
        ...bid,
        bidManagerId: bid.userId || bid.bidManagerId
      })),
      pagination: response.data.pagination
    }
  } catch (error) {
    console.error('Failed to fetch paginated bids from API:', error)
    return {
      bids: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    }
  }
}
