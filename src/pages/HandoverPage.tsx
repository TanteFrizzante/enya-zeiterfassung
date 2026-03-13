import { useMemo } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { CareSession } from '../types'
import { ACTIVE_CAREGIVER_LIST, CAREGIVERS } from '../config/caregivers'
import { CaregiverButton } from '../components/CaregiverButton'
import { ActiveTimer } from '../components/ActiveTimer'
import { DonutChart } from '../components/DonutChart'
import { CaregiverId } from '../types'
import { getScheduledCaregiver } from '../config/schedule'
import { getSessionsInRange } from '../services/sessionService'
import { useStats } from '../hooks/useStats'

interface Props {
  activeSession: CareSession | null
  onHandover: (id: CaregiverId) => void
}

function ChartLegend({ stats }: { stats: { caregiverId: CaregiverId; percentageOfTotal: number }[] }) {
  return (
    <div className="flex gap-3 mt-1.5">
      {stats.map((stat) => {
        const cg = CAREGIVERS[stat.caregiverId]
        return (
          <div key={stat.caregiverId} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cg.colorHex }}
            />
            <span className="text-[10px] text-gray-600">{cg.name}</span>
            <span
              className="text-[10px] font-bold"
              style={{ color: cg.colorHex }}
            >
              {stat.percentageOfTotal}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function HandoverPage({ activeSession, onHandover }: Props) {
  const scheduled = getScheduledCaregiver(new Date())
  const scheduledCg = scheduled ? CAREGIVERS[scheduled.caregiverId] : null

  const now = useMemo(() => new Date(), [])

  // Woche
  const weekRange = useMemo(() => ({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  }), [now])

  const weekSessions = useMemo(
    () => getSessionsInRange(weekRange.start, weekRange.end),
    [weekRange]
  )
  const weekStats = useStats(weekSessions)

  // Monat
  const monthRange = useMemo(() => ({
    start: startOfMonth(now),
    end: endOfMonth(now),
  }), [now])

  const monthSessions = useMemo(
    () => getSessionsInRange(monthRange.start, monthRange.end),
    [monthRange]
  )
  const monthStats = useStats(monthSessions)

  // Jahr 2026
  const yearRange = useMemo(() => {
    const y = new Date(2026, 0, 1)
    return { start: startOfYear(y), end: endOfYear(y) }
  }, [])

  const yearSessions = useMemo(
    () => getSessionsInRange(yearRange.start, yearRange.end),
    [yearRange]
  )
  const yearStats = useStats(yearSessions)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <ActiveTimer session={activeSession} />

      {/* Geplanter Betreuer laut Umgangsregelung */}
      {scheduledCg && !activeSession && (
        <div
          className="mx-4 mb-3 px-3 py-2 rounded-lg text-center text-sm"
          style={{
            backgroundColor: scheduledCg.colorHex + '15',
            color: scheduledCg.colorHex,
            border: `1px solid ${scheduledCg.colorHex}30`,
          }}
        >
          Laut Plan: <strong>{scheduledCg.name}</strong> ({scheduled!.label})
        </div>
      )}

      <div className="px-4 pb-4 flex-1">
        <p className="text-center text-gray-500 text-sm mb-4">
          Wer übernimmt Enya?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ACTIVE_CAREGIVER_LIST.map((cg) => (
            <CaregiverButton
              key={cg.id}
              caregiver={cg}
              isActive={activeSession?.caregiverId === cg.id}
              isScheduled={scheduled?.caregiverId === cg.id}
              onTap={() => onHandover(cg.id)}
            />
          ))}
        </div>

        {/* Drei Kuchendiagramme nebeneinander */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {/* Diese Woche */}
          <div className="flex flex-col items-center">
            <p className="text-[10px] text-gray-400 mb-1.5 font-medium">Diese Woche</p>
            <DonutChart stats={weekStats} size="sm" />
            <ChartLegend stats={weekStats} />
          </div>

          {/* Dieser Monat */}
          <div className="flex flex-col items-center">
            <p className="text-[10px] text-gray-400 mb-1.5 font-medium">Dieser Monat</p>
            <DonutChart stats={monthStats} size="sm" />
            <ChartLegend stats={monthStats} />
          </div>

          {/* 2026 */}
          <div className="flex flex-col items-center">
            <p className="text-[10px] text-gray-400 mb-1.5 font-medium">2026</p>
            <DonutChart stats={yearStats} size="sm" />
            <ChartLegend stats={yearStats} />
          </div>
        </div>
      </div>
    </div>
  )
}
