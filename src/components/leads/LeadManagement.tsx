import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Building, User, Phone, Mail, DollarSign, Calendar } from 'lucide-react'
import { Lead } from '@/types'
import { blink } from '@/blink/client'

interface LeadManagementProps {
  leads: Lead[]
  onLeadAdded: () => void
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  qualified: 'bg-purple-100 text-purple-800 border-purple-200',
  proposal: 'bg-orange-100 text-orange-800 border-orange-200',
  negotiation: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  closed: 'bg-green-100 text-green-800 border-green-200',
  lost: 'bg-red-100 text-red-800 border-red-200'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

export function LeadManagement({ leads, onLeadAdded }: LeadManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    priority: 'medium',
    source: '',
    estimatedValue: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyName || !formData.contactName) return

    setIsSubmitting(true)
    try {
      const user = await blink.auth.me()
      
      await blink.db.leads.create({
        id: `lead_${Date.now()}`,
        userId: user.id,
        teamMemberId: user.id,
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        status: 'new',
        priority: formData.priority as 'low' | 'medium' | 'high',
        source: formData.source || undefined,
        notes: formData.notes || undefined,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Create activity record
      await blink.db.activities.create({
        id: `activity_${Date.now()}`,
        userId: user.id,
        teamMemberId: user.id,
        activityType: 'lead_created',
        title: `New lead: ${formData.companyName}`,
        description: `Lead created for ${formData.contactName} at ${formData.companyName}`,
        relatedId: `lead_${Date.now()}`
      })

      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        priority: 'medium',
        source: '',
        estimatedValue: '',
        notes: ''
      })
      setIsDialogOpen(false)
      onLeadAdded()
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const groupedLeads = leads.reduce((acc, lead) => {
    if (!acc[lead.status]) acc[lead.status] = []
    acc[lead.status].push(lead)
    return acc
  }, {} as Record<string, Lead[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600">Track and manage your sales pipeline</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="ABC Corporation"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Name</Label>
                  <Input
                    id="contact"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="John Smith"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="john@abc.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Estimated Value ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="source">Lead Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="Website, Referral, Cold Call, etc."
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional information about this lead..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Creating...' : 'Create Lead'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'].map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 capitalize">{status}</h3>
              <Badge variant="secondary" className="text-xs">
                {groupedLeads[status]?.length || 0}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {groupedLeads[status]?.map((lead) => (
                <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{lead.companyName}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${priorityColors[lead.priority]}`}
                        >
                          {lead.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="h-3 w-3" />
                          {lead.contactName}
                        </div>
                        {lead.contactEmail && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="h-3 w-3" />
                            {lead.contactEmail}
                          </div>
                        )}
                        {lead.estimatedValue && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <DollarSign className="h-3 w-3" />
                            ${lead.estimatedValue.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="text-xs text-gray-500 line-clamp-2">{lead.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {leads.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads generated</h3>
            <p className="text-gray-600 text-center">
              Start generating leads to build your sales pipeline and track opportunities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}