import { TabId } from '../types'

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'handover', label: 'Übergabe', icon: '🤝' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
  { id: 'stats', label: 'Statistik', icon: '📊' },
]

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="flex border-t border-gray-200 bg-white safe-bottom">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex flex-col items-center py-2 pt-3 transition-colors ${
            activeTab === tab.id
              ? 'text-blue-600'
              : 'text-gray-400'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
