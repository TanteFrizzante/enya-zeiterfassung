import { useState, useMemo } from 'react'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  isSameDay,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { StatsPeriod, CareSession } from '../types'
import { CAREGIVERS, ACTIVE_CAREGIVER_LIST } from '../config/caregivers'
import { getSessionsInRange } from '../services/sessionService'
import { useStats } from '../hooks/useStats'
import { DonutChart } from '../components/DonutChart'

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${pad(seconds)}s`
  }
  return `${seconds}s`
}

function formatDurationShort(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/** Daily breakdown bar chart */
function DailyBreakdown({
  sessions,
  days,
}: {
  sessions: CareSession[]
  days: Date[]
}) {
  const dailyData = days.map((day) => {
    const dayStart = startOfDay(day).getTime()
    const dayEnd = endOfDay(day).getTime()
    const daySessions = sessions.filter((s) => {
      const sEnd = s.endTime ?? Date.now()
      return sEnd > dayStart && s.startTime < dayEnd
    })

    let jaieSeconds = 0
    let mukSeconds = 0

    for (const s of daySessions) {
      const start = Math.max(s.startTime, dayStart)
      const end = Math.min(s.endTime ?? Date.now(), dayEnd)
      const secs = (end - start) / 1000
      if (s.caregiverId === 'jaie') jaieSeconds += secs
      else if (s.caregiverId === 'andreas') mukSeconds += secs
    }

    return { day, jaieSeconds, mukSeconds, total: jaieSeconds + mukSeconds }
  })

  const maxTotal = Math.max(...dailyData.map((d) => d.total), 1)
  const isToday = (d: Date) => isSameDay(d, new Date())

  return (
    <div className="space-y-1.5">
      {dailyData.map(({ day, jaieSeconds, mukSeconds, total }) => {
        const jaiePct = total > 0 ? (jaieSeconds / maxTotal) * 100 : 0
        const mukPct = total > 0 ? (mukSeconds / maxTotal) * 100 : 0

        return (
          <div key={day.toISOString()} className="flex items-center gap-2">
            <span
              className={`text-xs w-8 text-right shrink-0 ${
                isToday(day) ? 'font-bold text-blue-600' : 'text-gray-500'
              }`}
            >
              {format(day, 'EEE', { locale: de })}
            </span>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden flex">
              {jaiePct > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${jaiePct}%`,
                    backgroundColor: CAREGIVERS.jaie.colorHex,
                  }}
                />
              )}
              {mukPct > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${mukPct}%`,
                    backgroundColor: CAREGIVERS.andreas.colorHex,
                  }}
                />
              )}
            </div>
            <span className="text-xs text-gray-400 w-12 text-right shrink-0">
              {total > 0 ? formatDurationShort(Math.round(total)) : '–'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

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
  const totalSeconds = stats.reduce((sum, s) => sum + s.totalSeconds, 0)

  const days = useMemo(
    () => eachDayOfInterval({ start: range.start, end: range.end }),
    [range]
  )

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

      <p className="text-center text-xs text-gray-400 mt-2 mb-3">
        {format(range.start, 'd. MMM', { locale: de })} –{' '}
        {format(range.end, 'd. MMM yyyy', { locale: de })}
      </p>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Donut chart + legend */}
        <div className="bg-white rounded-xl p-4">
          <DonutChart stats={stats} />
          <div className="flex justify-center gap-6 mt-3">
            {stats.map((stat) => {
              const cg = CAREGIVERS[stat.caregiverId]
              return (
                <div key={stat.caregiverId} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cg.colorHex }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {cg.name}
                  </span>
                  <span className="text-sm font-bold" style={{ color: cg.colorHex }}>
                    {stat.percentageOfTotal}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Caregiver detail cards */}
        {stats.map((stat) => {
          const cg = CAREGIVERS[stat.caregiverId]

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
                  {formatDuration(stat.totalSeconds)}
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

        {/* Daily breakdown */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Tagesübersicht
          </h3>
          <DailyBreakdown sessions={sessions} days={days} />
        </div>

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
      {totalSeconds > 0 && (
        <div className="px-4 py-3 bg-white border-t border-gray-200 text-center">
          <span className="text-sm text-gray-500">Gesamt: </span>
          <span className="font-bold text-gray-800">
            {formatDuration(totalSeconds)}
          </span>
        </div>
      )}
    </div>
  )
}
