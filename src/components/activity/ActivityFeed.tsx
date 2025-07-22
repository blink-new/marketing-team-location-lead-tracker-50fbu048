import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Target, Users, MapPin, Clock } from 'lucide-react'
import { TeamActivity } from '@/types'

interface ActivityFeedProps {
  activities: TeamActivity[]
}

const activityIcons = {
  visit: Camera,
  lead_created: Target,
  lead_updated: Target,
  team_update: Users
}

const activityColors = {
  visit: 'bg-green-100 text-green-700',
  lead_created: 'bg-blue-100 text-blue-700',
  lead_updated: 'bg-yellow-100 text-yellow-700',
  team_update: 'bg-purple-100 text-purple-700'
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const groupedActivities = sortedActivities.reduce((acc, activity) => {
    const date = new Date(activity.createdAt).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(activity)
    return acc
  }, {} as Record<string, TeamActivity[]>)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Feed</h2>
        <p className="text-gray-600">Real-time updates from your marketing team</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-gray-900">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {dayActivities.length} activities
              </Badge>
            </div>

            <div className="space-y-3">
              {dayActivities.map((activity) => {
                const Icon = activityIcons[activity.activityType] || MapPin
                return (
                  <Card key={activity.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${activityColors[activity.activityType] || 'bg-gray-100 text-gray-700'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(activity.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                          
                          {activity.description && (
                            <p className="text-sm text-gray-600">{activity.description}</p>
                          )}
                          
                          {activity.teamMember && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-700">
                                  {activity.teamMember.name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {activity.teamMember.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600 text-center">
              Team activities will appear here as they happen. Start by recording visits or creating leads.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}