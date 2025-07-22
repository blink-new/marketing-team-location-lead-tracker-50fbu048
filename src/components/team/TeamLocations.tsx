import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Phone, Mail, Users } from 'lucide-react'
import { TeamMember } from '@/types'

interface TeamLocationsProps {
  teamMembers: TeamMember[]
}

export function TeamLocations({ teamMembers }: TeamLocationsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Locations</h2>
          <p className="text-gray-600">Real-time tracking of your marketing team</p>
        </div>
        <Button>
          <MapPin className="mr-2 h-4 w-4" />
          View Map
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <Badge 
                  variant={member.status === 'active' ? 'default' : 'secondary'}
                  className={
                    member.status === 'active' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : member.status === 'online'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }
                >
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Last seen: {new Date(member.lastSeen).toLocaleString()}
              </div>

              {member.lastLocationLat && member.lastLocationLng && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  Location: {member.lastLocationLat.toFixed(4)}, {member.lastLocationLng.toFixed(4)}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="mr-2 h-3 w-3" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MapPin className="mr-2 h-3 w-3" />
                  Track
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600 text-center">
              Add team members to start tracking their locations and activities.
            </p>
            <Button className="mt-4">Add Team Member</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}