import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/analyticsService'
import { FileText, Link2, Tag, TrendingUp, Activity } from 'lucide-react'

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getOverview(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  const stats = analytics?.system_stats

  const statCards = [
    {
      name: 'Total Notes',
      value: stats?.total_notes || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Ideas',
      value: stats?.total_ideas || 0,
      icon: Link2,
      color: 'bg-purple-500',
    },
    {
      name: 'Connections',
      value: stats?.total_connections || 0,
      icon: Link2,
      color: 'bg-green-500',
    },
    {
      name: 'Tags',
      value: stats?.total_tags || 0,
      icon: Tag,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your knowledge base
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Recent Notes</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {analytics?.activity_metrics.recent_notes || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Activity</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {analytics?.activity_metrics.last_activity
                  ? new Date(analytics.activity_metrics.last_activity).toLocaleDateString()
                  : 'Never'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Tags
          </h2>
          <div className="space-y-2">
            {analytics?.top_tags && analytics.top_tags.length > 0 ? (
              analytics.top_tags.slice(0, 5).map((tag) => (
                <div key={tag.tag} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{tag.tag}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tag.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({tag.percentage}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No tags yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

