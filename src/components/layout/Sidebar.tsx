import { 
  LayoutDashboard, 
  MapPin, 
  Camera, 
  Users, 
  Target, 
  BarChart3,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'team', name: 'Team Locations', icon: MapPin },
  { id: 'visits', name: 'Visit Check-ins', icon: Camera },
  { id: 'leads', name: 'Lead Management', icon: Target },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'activity', name: 'Activity Feed', icon: Activity },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors',
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}