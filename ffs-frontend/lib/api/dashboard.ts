import apiClient from './client'

export interface DashboardMetrics {
  active_bids: number
  pending_approvals: number
  active_vendors?: number
  member_districts?: number
  active_bids_change: string
  pending_approvals_change: string
  vendors_or_districts_change: string
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await apiClient.get('/dashboard')
    return response.data
  } catch (error) {
    console.error('Failed to fetch dashboard metrics from API:', error)
    throw error
  }
}

export interface USDANewsItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
}

export interface USDANewsResponse {
  success: boolean
  data: USDANewsItem[]
  count: number
}

export async function getUSDANews(): Promise<USDANewsItem[]> {
  try {
    const response = await apiClient.get<USDANewsResponse>('/usda-news')
    return response.data.data
  } catch (error) {
    console.error('Failed to fetch USDA news from API:', error)
    throw error
  }
}
