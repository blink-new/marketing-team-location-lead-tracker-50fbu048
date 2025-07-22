export interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  role: string
  status: 'online' | 'offline' | 'active'
  lastLocationLat?: number
  lastLocationLng?: number
  lastSeen: string
  createdAt: string
}

export interface Visit {
  id: string
  userId: string
  teamMemberId: string
  locationName: string
  locationLat: number
  locationLng: number
  photoUrl?: string
  notes?: string
  visitTime: string
  createdAt: string
  teamMember?: TeamMember
}

export interface Lead {
  id: string
  userId: string
  teamMemberId?: string
  companyName: string
  contactName: string
  contactEmail?: string
  contactPhone?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost'
  priority: 'low' | 'medium' | 'high'
  source?: string
  notes?: string
  estimatedValue?: number
  followUpDate?: string
  createdAt: string
  updatedAt: string
  teamMember?: TeamMember
}

export interface TeamActivity {
  id: string
  userId: string
  teamMemberId?: string
  activityType: 'visit' | 'lead_created' | 'lead_updated' | 'team_update'
  title: string
  description?: string
  relatedId?: string
  createdAt: string
  teamMember?: TeamMember
}