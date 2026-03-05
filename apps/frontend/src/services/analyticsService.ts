import api from './api'

export interface SystemStats {
  total_notes: number
  total_ideas: number
  total_connections: number
  total_tags: number
  unique_users: number
}

export interface AnalyticsResponse {
  timestamp: string
  system_stats: SystemStats
  activity_metrics: {
    recent_notes: number
    recent_ideas: number
    recent_searches: number
    last_activity: string | null
  }
  top_tags: Array<{
    tag: string
    count: number
    percentage: number
  }>
  database_health: {
    postgres_status: string
    neo4j_status: string
    postgres_size: string
    neo4j_size: string
  }
}

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsResponse> => {
    const response = await api.get('/analytics/overview')
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/analytics/stats')
    return response.data
  },
}



