import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Clock, Phone, Mail, Users, Plus, Loader2 } from 'lucide-react'
import { TeamMember } from '@/types'
import { useState } from 'react'
import { blink } from '@/blink/client'
import { toast } from '@/hooks/use-toast'

interface TeamLocationsProps {
  teamMembers: TeamMember[]
  onTeamMemberAdded?: () => void
}

interface AddTeamMemberForm {
  name: string
  email: string
  role: string
  phone?: string
}

function AddTeamMemberDialog({ onTeamMemberAdded }: { onTeamMemberAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<AddTeamMemberForm>({
    name: '',
    email: '',
    role: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name || !form.email || !form.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const user = await blink.auth.me()
      
      await blink.db.teamMembers.create({
        id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        name: form.name,
        email: form.email,
        role: form.role,
        status: 'offline',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })

      toast({
        title: "Team Member Added",
        description: `${form.name} has been successfully added to your team.`
      })

      setForm({ name: '', email: '', role: '', phone: '' })
      setOpen(false)
      onTeamMemberAdded?.()
    } catch (error) {
      console.error('Error adding team member:', error)
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                <SelectItem value="Field Agent">Field Agent</SelectItem>
                <SelectItem value="Team Lead">Team Lead</SelectItem>
                <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
                <SelectItem value="Business Development">Business Development</SelectItem>
                <SelectItem value="Account Manager">Account Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TeamLocations({ teamMembers, onTeamMemberAdded }: TeamLocationsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Locations</h2>
          <p className="text-gray-600">Real-time tracking of your marketing team</p>
        </div>
        <div className="flex gap-3">
          <AddTeamMemberDialog onTeamMemberAdded={onTeamMemberAdded} />
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            View Map
          </Button>
        </div>
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
            <p className="text-gray-600 text-center mb-4">
              Add team members to start tracking their locations and activities.
            </p>
            <AddTeamMemberDialog onTeamMemberAdded={onTeamMemberAdded} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}