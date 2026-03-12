import { useState } from 'react'
import { TabId } from './types'
import { BottomNav } from './components/BottomNav'
import { HandoverPage } from './pages/HandoverPage'
import { CalendarPage } from './pages/CalendarPage'
import { StatsPage } from './pages/StatsPage'
import { useActiveSession } from './hooks/useActiveSession'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('handover')
  const { activeSession, handover } = useActiveSession()

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-center">
        <h1 className="text-lg font-bold text-gray-800">
          👶 Enya Zeiterfassung
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'handover' && (
          <HandoverPage
            activeSession={activeSession}
            onHandover={handover}
          />
        )}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'stats' && <StatsPage />}
      </main>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
