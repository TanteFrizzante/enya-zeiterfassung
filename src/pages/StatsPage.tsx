import { useState, useMemo } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { StatsPeriod } from '../types'
import { CAREGIVERS } from '../config/caregivers'
import { getSessionsInRange } from '../services/sessionService'
import { useStats } from '../hooks/useStats'

export function StatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>('week')

  const range = useMemo(() => {
    const now = new Date()
    if (period === 'week') {
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      }
    }
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
    }
  }, [period])

  const sessions = useMemo(
    () => getSessionsInRange(range.start, range.end),
    [range]
  )

  const stats = useStats(sessions)

  const totalMinutes = stats.reduce((sum, s) => sum + s.totalMinutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60

  return (
    <div className="flex flex-col h-full">
      {/* Period toggle */}
      <div className="flex gap-1 mx-4 mt-4 p-1 bg-gray-100 rounded-lg">
        {(['week', 'month'] as StatsPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              period === p
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {p === 'week' ? 'Diese Woche' : 'Dieser Monat'}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-2">
        {format(range.start, 'd. MMM', { locale: de })} –{' '}
        {format(range.end, 'd. MMM yyyy', { locale: de })}
      </p>

      {/* Stats cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {stats.map((stat) => {
          const cg = CAREGIVERS[stat.caregiverId]
          const hours = Math.floor(stat.totalMinutes / 60)
          const mins = stat.totalMinutes % 60

          return (
            <div
              key={stat.caregiverId}
              className="bg-white rounded-xl p-4 border-l-4"
              style={{ borderLeftColor: cg.colorHex }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-lg font-semibold text-gray-800">
                    {cg.emoji} {cg.name}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">{cg.role}</span>
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.percentageOfTotal}%`,
                    backgroundColor: cg.colorHex,
                  }}
                />
              </div>

              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">
                  {stat.sessionCount}{' '}
                  {stat.sessionCount === 1 ? 'Eintrag' : 'Einträge'}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {stat.percentageOfTotal}%
                </span>
              </div>
            </div>
          )
        })}

        {stats.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Keine Daten</p>
            <p className="text-sm mt-1">
              Starte eine Betreuung auf der Übergabe-Seite
            </p>
          </div>
        )}
      </div>

      {/* Total */}
      {totalMinutes > 0 && (
        <div className="px-4 py-3 bg-white border-t border-gray-200 text-center">
          <span className="text-sm text-gray-500">Gesamt: </span>
          <span className="font-bold text-gray-800">
            {totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`}
          </span>
        </div>
      )}
    </div>
  )
}
