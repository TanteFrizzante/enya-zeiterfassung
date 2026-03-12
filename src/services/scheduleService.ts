import { CareSession } from '../types'
import { getScheduledCaregiver } from '../config/schedule'
import { eachDayOfInterval, startOfDay } from 'date-fns'

const PREFILL_KEY = 'enya-prefilled-until'

function generateId(): string {
  return 'sched-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
}

/**
 * Generiert geplante Sessions für einen Datumsbereich
 * basierend auf der festen Umgangsregelung
 */
export function generateScheduledSessions(
  startDate: Date,
  endDate: Date
): CareSession[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const sessions: CareSession[] = []

  for (const day of days) {
    const schedule = getScheduledCaregiver(day)
    if (!schedule) continue

    const dayStart = startOfDay(day)
    const start = new Date(dayStart)
    start.setHours(schedule.startHour, schedule.startMinute, 0, 0)

    const end = new Date(dayStart)
    end.setHours(schedule.endHour, schedule.endMinute, 59, 999)

    sessions.push({
      id: generateId(),
      caregiverId: schedule.caregiverId,
      startTime: start.getTime(),
      endTime: end.getTime(),
    })
  }

  return sessions
}

/**
 * Füllt Sessions für die letzten 4 Wochen und die nächsten 4 Wochen vor,
 * falls noch nicht geschehen.
 */
export function prefillIfNeeded(): CareSession[] | null {
  const STORAGE_KEY = 'enya-sessions'
  const existingSessions = localStorage.getItem(STORAGE_KEY)

  // Nur vorfüllen wenn noch keine Sessions vorhanden
  // ODER wenn explizit noch nie vorgefüllt wurde
  const alreadyPrefilled = localStorage.getItem(PREFILL_KEY)
  if (alreadyPrefilled) return null

  const now = new Date()
  const fourWeeksAgo = new Date(now)
  fourWeeksAgo.setDate(now.getDate() - 28)

  const fourWeeksAhead = new Date(now)
  fourWeeksAhead.setDate(now.getDate() + 28)

  const scheduled = generateScheduledSessions(fourWeeksAgo, fourWeeksAhead)

  // Falls bereits manuelle Sessions existieren, nur die geplanten
  // für Tage OHNE manuelle Einträge hinzufügen
  const existing: CareSession[] = existingSessions
    ? JSON.parse(existingSessions)
    : []

  const existingDays = new Set(
    existing.map((s) => new Date(s.startTime).toDateString())
  )

  const newSessions = scheduled.filter(
    (s) => !existingDays.has(new Date(s.startTime).toDateString())
  )

  const merged = [...existing, ...newSessions]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  localStorage.setItem(PREFILL_KEY, now.toISOString())

  return merged
}
