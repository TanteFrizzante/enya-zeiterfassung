import { useState, useMemo } from 'react'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addWeeks,
  addMonths,
  addYears,
  format,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { CareSession } from '../types'
import { CAREGIVERS, ACTIVE_CAREGIVER_LIST } from '../config/caregivers'
import { getSessionsInRange } from '../services/sessionService'
import { getScheduledCaregiver } from '../config/schedule'

type CalendarView = 'today' | 'week' | 'month' | '2024' | '2025' | '2026'

const VIEW_LABELS: Record<CalendarView, string> = {
  today: 'Heute',
  week: 'Woche',
  month: 'Monat',
  '2024': '2024',
  '2025': '2025',
  '2026': '2026',
}

function getRange(view: CalendarView, offset: number) {
  const now = new Date()

  switch (view) {
    case 'today': {
      const day = new Date(now)
      day.setDate(day.getDate() + offset)
      return { start: startOfDay(day), end: endOfDay(day) }
    }
    case 'week': {
      const w = startOfWeek(addWeeks(now, offset), { weekStartsOn: 1 })
      return { start: w, end: endOfWeek(w, { weekStartsOn: 1 }) }
    }
    case 'month': {
      const m = startOfMonth(addMonths(now, offset))
      return { start: m, end: endOfMonth(m) }
    }
    case '2024': {
      const y = new Date(2024, 0, 1)
      return { start: startOfYear(y), end: endOfYear(y) }
    }
    case '2025': {
      const y = new Date(2025, 0, 1)
      return { start: startOfYear(y), end: endOfYear(y) }
    }
    case '2026': {
      const y = new Date(2026, 0, 1)
      return { start: startOfYear(y), end: endOfYear(y) }
    }
  }
}

function formatRangeLabel(view: CalendarView, start: Date, end: Date): string {
  switch (view) {
    case 'today':
      return format(start, 'EEEE, d. MMMM yyyy', { locale: de })
    case 'week':
      return `${format(start, 'd. MMM', { locale: de })} – ${format(end, 'd. MMM yyyy', { locale: de })}`
    case 'month':
      return format(start, 'MMMM yyyy', { locale: de })
    case '2024':
    case '2025':
    case '2026':
      return view
  }
}

/** Compact month summary for year views */
function MonthSummary({
  month,
  sessions,
}: {
  month: Date
  sessions: CareSession[]
}) {
  const mStart = startOfMonth(month).getTime()
  const mEnd = endOfMonth(month).getTime()

  let jaieSeconds = 0
  let mukSeconds = 0

  for (const s of sessions) {
    const sEnd = s.endTime ?? Date.now()
    if (sEnd <= mStart || s.startTime >= mEnd) continue
    const start = Math.max(s.startTime, mStart)
    const end = Math.min(sEnd, mEnd)
    const secs = (end - start) / 1000
    if (s.caregiverId === 'jaie') jaieSeconds += secs
    else if (s.caregiverId === 'andreas') mukSeconds += secs
  }

  const total = jaieSeconds + mukSeconds
  const jaiePct = total > 0 ? Math.round((jaieSeconds / total) * 100) : 0
  const mukPct = total > 0 ? 100 - jaiePct : 0

  const formatH = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className="bg-white rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          {format(month, 'MMMM', { locale: de })}
        </span>
        <span className="text-xs text-gray-400">
          {total > 0 ? formatH(Math.round(total)) : '–'}
        </span>
      </div>
      {total > 0 ? (
        <>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {jaiePct > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${jaiePct}%`,
                  backgroundColor: CAREGIVERS.jaie.colorHex,
                }}
              />
            )}
            {mukPct > 0 && (
              <div
                className="h-full"
                style={{
                  width: `${mukPct}%`,
                  backgroundColor: CAREGIVERS.andreas.colorHex,
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-500">
            <span>
              <span style={{ color: CAREGIVERS.jaie.colorHex }} className="font-medium">
                Jaie {jaiePct}%
              </span>
              {' · '}
              {formatH(Math.round(jaieSeconds))}
            </span>
            <span>
              <span style={{ color: CAREGIVERS.andreas.colorHex }} className="font-medium">
                Muk {mukPct}%
              </span>
              {' · '}
              {formatH(Math.round(mukSeconds))}
            </span>
          </div>
        </>
      ) : (
        <div className="h-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-[10px] text-gray-400">Keine Daten</span>
        </div>
      )}
    </div>
  )
}

export function CalendarPage() {
  const [view, setView] = useState<CalendarView>('week')
  const [offset, setOffset] = useState(0)

  // Year views have no offset navigation
  const isYearView = view === '2024' || view === '2025' || view === '2026'

  const { start, end } = useMemo(() => getRange(view, offset), [view, offset])

  const days = useMemo(() => {
    if (isYearView) return [] // year views use MonthSummary instead
    return eachDayOfInterval({ start, end })
  }, [start, end, isYearView])

  const sessions = useMemo(
    () => getSessionsInRange(start, end),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start.getTime(), end.getTime()]
  )

  const months = useMemo(() => {
    if (!isYearView) return []
    return Array.from({ length: 12 }, (_, i) => new Date(start.getFullYear(), i, 1))
  }, [isYearView, start])

  // Reset offset when switching views
  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
    setOffset(0)
  }

  const canNavigate = !isYearView

  return (
    <div className="flex flex-col h-full">
      {/* View selector */}
      <div className="flex gap-1 mx-3 mt-3 p-1 bg-gray-100 rounded-lg">
        {(Object.keys(VIEW_LABELS) as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => handleViewChange(v)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              view === v
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 mt-2">
        {canNavigate ? (
          <>
            <button
              onClick={() => setOffset((o) => o - 1)}
              className="p-2 text-gray-600 text-lg"
            >
              ←
            </button>
            <div className="text-center">
              <span className="font-semibold text-gray-800 text-sm">
                {formatRangeLabel(view, start, end)}
              </span>
              {offset !== 0 && (
                <button
                  onClick={() => setOffset(0)}
                  className="block mx-auto text-xs text-blue-500 mt-0.5"
                >
                  Heute
                </button>
              )}
            </div>
            <button
              onClick={() => setOffset((o) => o + 1)}
              className="p-2 text-gray-600 text-lg"
            >
              →
            </button>
          </>
        ) : (
          <div className="text-center w-full py-1">
            <span className="font-semibold text-gray-800 text-sm">
              {formatRangeLabel(view, start, end)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isYearView ? (
          // Year view: month summaries
          months.map((month) => (
            <MonthSummary
              key={month.toISOString()}
              month={month}
              sessions={sessions}
            />
          ))
        ) : (
          // Day-level views
          days.map((day) => (
            <DayRow key={day.toISOString()} day={day} sessions={sessions} />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 px-4 py-2 bg-white border-t border-gray-100">
        {ACTIVE_CAREGIVER_LIST.map((cg) => (
          <div key={cg.id} className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: cg.colorHex }}
            />
            <span className="text-xs text-gray-600">{cg.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DayRow({
  day,
  sessions,
}: {
  day: Date
  sessions: CareSession[]
}) {
  const isToday = isSameDay(day, new Date())
  const dayStart = startOfDay(day).getTime()
  const dayEnd = endOfDay(day).getTime()
  const scheduled = getScheduledCaregiver(day)
  const scheduledCg = scheduled ? CAREGIVERS[scheduled.caregiverId] : null

  const dayBlocks = sessions
    .filter((s) => {
      const sEnd = s.endTime ?? Date.now()
      return sEnd > dayStart && s.startTime < dayEnd
    })
    .map((s) => {
      const clampedStart = Math.max(s.startTime, dayStart)
      const clampedEnd = Math.min(s.endTime ?? Date.now(), dayEnd)
      return {
        ...s,
        displayStart: clampedStart,
        displayEnd: clampedEnd,
      }
    })

  const totalDayMs = dayEnd - dayStart

  return (
    <div
      className={`rounded-lg p-3 ${
        isToday ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm font-medium ${
            isToday ? 'text-blue-700' : 'text-gray-700'
          }`}
        >
          {format(day, 'EEE, d. MMM', { locale: de })}
          {isToday && (
            <span className="ml-1 text-xs text-blue-500 font-normal">
              (heute)
            </span>
          )}
        </span>
        {scheduledCg && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: scheduledCg.colorHex + '20',
              color: scheduledCg.colorHex,
            }}
          >
            {scheduled!.label}
          </span>
        )}
      </div>

      {dayBlocks.length === 0 ? (
        <div className="h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
          <span className="text-xs text-gray-400">Keine Einträge</span>
        </div>
      ) : (
        <>
          <div className="h-8 bg-gray-100 rounded-full overflow-hidden relative">
            {dayBlocks.map((block, i) => {
              const leftPercent =
                ((block.displayStart - dayStart) / totalDayMs) * 100
              const widthPercent =
                ((block.displayEnd - block.displayStart) / totalDayMs) * 100
              const cg = CAREGIVERS[block.caregiverId]

              return (
                <div
                  key={i}
                  className="absolute h-full rounded-sm"
                  style={{
                    backgroundColor: cg.colorHex,
                    left: `${leftPercent}%`,
                    width: `${Math.max(widthPercent, 1)}%`,
                  }}
                  title={`${cg.name}: ${format(new Date(block.displayStart), 'HH:mm:ss')} - ${format(new Date(block.displayEnd), 'HH:mm:ss')}`}
                />
              )
            })}
          </div>

          <div className="mt-2 space-y-1">
            {dayBlocks.map((block, i) => {
              const cg = CAREGIVERS[block.caregiverId]
              const durationSec = Math.round(
                (block.displayEnd - block.displayStart) / 1000
              )
              const hours = Math.floor(durationSec / 3600)
              const mins = Math.floor((durationSec % 3600) / 60)
              const secs = durationSec % 60
              const pad = (n: number) => n.toString().padStart(2, '0')

              return (
                <div key={i} className="flex items-center text-xs text-gray-600">
                  <span
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: cg.colorHex }}
                  />
                  <span className="font-medium mr-1">{cg.name}</span>
                  <span>
                    {format(new Date(block.displayStart), 'HH:mm:ss')} –{' '}
                    {format(new Date(block.displayEnd), 'HH:mm:ss')}
                  </span>
                  <span className="ml-auto text-gray-400">
                    {hours > 0 ? `${hours}h ${pad(mins)}m ${pad(secs)}s` : mins > 0 ? `${mins}m ${pad(secs)}s` : `${secs}s`}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
