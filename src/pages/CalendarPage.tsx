import { useState, useMemo } from 'react'
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  format,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { CareSession } from '../types'
import { CAREGIVERS } from '../config/caregivers'
import { getSessionsInRange } from '../services/sessionService'
import { getScheduledCaregiver } from '../config/schedule'

export function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), {
    weekStartsOn: 1,
  })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const sessions = useMemo(
    () => getSessionsInRange(weekStart, weekEnd),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart.getTime(), weekEnd.getTime()]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-2 text-gray-600 text-xl"
        >
          ←
        </button>
        <div className="text-center">
          <span className="font-semibold text-gray-800">
            {format(weekStart, 'd. MMM', { locale: de })} –{' '}
            {format(weekEnd, 'd. MMM yyyy', { locale: de })}
          </span>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="block mx-auto text-xs text-blue-500 mt-0.5"
            >
              Heute
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="p-2 text-gray-600 text-xl"
        >
          →
        </button>
      </div>

      {/* Days */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {days.map((day) => (
          <DayRow key={day.toISOString()} day={day} sessions={sessions} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 px-4 py-2 bg-white border-t border-gray-100">
        {Object.values(CAREGIVERS).map((cg) => (
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
