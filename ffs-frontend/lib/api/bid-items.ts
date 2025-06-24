import apiClient from './client'

export interface BidItem {
  id: string | number
  bidId: number
  itemName: string
  awardGroup?: string
  projectionUnit: string
  bidUnit: string
  bidUnitProjUnit: number
  minProjection?: number
  status?: string
  diversion?: string
  acceptableBrands?: string
  bidSpecification?: string
  projection?: number
  totalBidUnits?: number
  percentDistrictsUsing?: number
  bidName?: string
}

export interface CreateBidItemRequest {
  bidId: number
  itemName: string
  awardGroup?: string
  projectionUnit: string
  bidUnit: string
  bidUnitProjUnit: number
  minProjection?: number
  status?: string
  diversion?: string
  acceptableBrands?: string
  bidSpecification?: string
  projection?: number
  totalBidUnits?: number
  percentDistrictsUsing?: number
}

export async function createBidItem(bidItemData: CreateBidItemRequest): Promise<BidItem> {
  try {
    const response = await apiClient.post('/bid-items', bidItemData)
    return response.data
  } catch (error) {
    console.error('Failed to create bid item:', error)
    throw error
  }
}

export async function getBidItemsByBidId(bidId: number): Promise<BidItem[]> {
  try {
    const response = await apiClient.get(`/bid-items/bid/${bidId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch bid items:', error)
    return []
  }
}

export async function getAllBidItems(): Promise<BidItem[]> {
  try {
    const response = await apiClient.get('/bid-items')
    return response.data
  } catch (error) {
    console.error('Failed to fetch all bid items:', error)
    return []
  }
}
