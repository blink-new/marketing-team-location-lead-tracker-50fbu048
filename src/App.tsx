import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { TeamLocations } from '@/components/team/TeamLocations'
import { VisitCheckins } from '@/components/visits/VisitCheckins'
import { LeadManagement } from '@/components/leads/LeadManagement'
import { Analytics } from '@/components/analytics/Analytics'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { Toaster } from '@/components/ui/toaster'
import { blink } from '@/blink/client'
import { TeamMember, Visit, Lead, TeamActivity } from '@/types'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Data states
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [activities, setActivities] = useState<TeamActivity[]>([])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadData = useCallback(async () => {
    try {
      // Load team members
      const teamData = await blink.db.teamMembers.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setTeamMembers(teamData)

      // Load visits
      const visitData = await blink.db.visits.list({
        where: { userId: user.id },
        orderBy: { visitTime: 'desc' }
      })
      setVisits(visitData)

      // Load leads
      const leadData = await blink.db.leads.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setLeads(leadData)

      // Load activities
      const activityData = await blink.db.activities.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })
      setActivities(activityData)

    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [user])

  const createSampleData = useCallback(async () => {
    try {
      // Create sample team members
      const sampleMembers = [
        {
          id: `member_${Date.now()}_1`,
          userId: user.id,
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          role: 'Senior Marketing Rep',
          status: 'active' as const,
          lastLocationLat: 40.7128,
          lastLocationLng: -74.0060,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `member_${Date.now()}_2`,
          userId: user.id,
          name: 'Mike Chen',
          email: 'mike@company.com',
          role: 'Marketing Specialist',
          status: 'online' as const,
          lastLocationLat: 40.7589,
          lastLocationLng: -73.9851,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `member_${Date.now()}_3`,
          userId: user.id,
          name: 'Emily Rodriguez',
          email: 'emily@company.com',
          role: 'Field Marketing Manager',
          status: 'offline' as const,
          lastLocationLat: 40.7505,
          lastLocationLng: -73.9934,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ]

      for (const member of sampleMembers) {
        await blink.db.teamMembers.create(member)
      }

      // Create sample visits
      const sampleVisits = [
        {
          id: `visit_${Date.now()}_1`,
          userId: user.id,
          teamMemberId: sampleMembers[0].id,
          locationName: 'TechCorp Headquarters',
          locationLat: 40.7128,
          locationLng: -74.0060,
          notes: 'Met with procurement team, very interested in our solution',
          visitTime: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: `visit_${Date.now()}_2`,
          userId: user.id,
          teamMemberId: sampleMembers[1].id,
          locationName: 'StartupHub Co-working',
          locationLat: 40.7589,
          locationLng: -73.9851,
          notes: 'Networking event, collected 5 business cards',
          visitTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        }
      ]

      for (const visit of sampleVisits) {
        await blink.db.visits.create(visit)
      }

      // Create sample leads
      const sampleLeads = [
        {
          id: `lead_${Date.now()}_1`,
          userId: user.id,
          teamMemberId: sampleMembers[0].id,
          companyName: 'TechCorp Solutions',
          contactName: 'David Wilson',
          contactEmail: 'david@techcorp.com',
          contactPhone: '+1 (555) 123-4567',
          status: 'qualified' as const,
          priority: 'high' as const,
          source: 'Field Visit',
          estimatedValue: 50000,
          notes: 'Looking for enterprise solution, budget approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `lead_${Date.now()}_2`,
          userId: user.id,
          teamMemberId: sampleMembers[1].id,
          companyName: 'InnovateLab',
          contactName: 'Lisa Chang',
          contactEmail: 'lisa@innovatelab.com',
          status: 'new' as const,
          priority: 'medium' as const,
          source: 'Networking Event',
          estimatedValue: 25000,
          notes: 'Startup looking to scale, interested in pilot program',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      for (const lead of sampleLeads) {
        await blink.db.leads.create(lead)
      }

      // Reload data
      loadData()
    } catch (error) {
      console.error('Error creating sample data:', error)
    }
  }, [user, loadData])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, loadData])

  // Create sample data if none exists
  useEffect(() => {
    if (user && teamMembers.length === 0) {
      createSampleData()
    }
  }, [user, teamMembers, createSampleData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your marketing dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Marketing Team Tracker</h1>
          <p className="text-gray-600">Please sign in to access your executive dashboard</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview teamMembers={teamMembers} visits={visits} leads={leads} />
      case 'team':
        return <TeamLocations teamMembers={teamMembers} onTeamMemberAdded={loadData} />
      case 'visits':
        return <VisitCheckins visits={visits} onVisitAdded={loadData} />
      case 'leads':
        return <LeadManagement leads={leads} onLeadAdded={loadData} />
      case 'analytics':
        return <Analytics teamMembers={teamMembers} visits={visits} leads={leads} />
      case 'activity':
        return <ActivityFeed activities={activities} />
      default:
        return <DashboardOverview teamMembers={teamMembers} visits={visits} leads={leads} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default App