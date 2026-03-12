import { CaregiverId } from '../types'

/**
 * Feste Umgangsregelung für Enya
 *
 * Wochentage (jede Woche gleich):
 *   Montag:     Muk (ab 15:30)
 *   Dienstag:   Muk (ganztägig)
 *   Mittwoch:   Jaie (ab 15:30)
 *   Donnerstag: Jaie (ganztägig)
 *
 * Wochenende (abwechselnd alle 2 Wochen):
 *   Woche A (Papa-WE): Fr-So Muk
 *   Woche B (Mama-WE): Fr-So Jaie
 *
 * Referenz: Freitag 13. März 2026 = Papa-Wochenende (WE MUK)
 */

export interface DaySchedule {
  caregiverId: CaregiverId
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  label: string
}

// 0=Sunday, 1=Monday, ... 6=Saturday
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

// Feste Wochentage (jede Woche gleich)
export const FIXED_WEEKDAYS: Partial<Record<DayOfWeek, DaySchedule>> = {
  1: { // Montag
    caregiverId: 'andreas',
    startHour: 15,
    startMinute: 30,
    endHour: 23,
    endMinute: 59,
    label: 'Muk ab 15:30',
  },
  2: { // Dienstag
    caregiverId: 'andreas',
    startHour: 0,
    startMinute: 0,
    endHour: 23,
    endMinute: 59,
    label: 'Muk (ganztägig)',
  },
  3: { // Mittwoch
    caregiverId: 'jaie',
    startHour: 15,
    startMinute: 30,
    endHour: 23,
    endMinute: 59,
    label: 'Jaie ab 15:30',
  },
  4: { // Donnerstag
    caregiverId: 'jaie',
    startHour: 0,
    startMinute: 0,
    endHour: 23,
    endMinute: 59,
    label: 'Jaie (ganztägig)',
  },
}

// Wochenende: Fr, Sa, So ganztägig
export const WEEKEND_SCHEDULE: DaySchedule = {
  caregiverId: 'andreas', // wird dynamisch überschrieben
  startHour: 0,
  startMinute: 0,
  endHour: 23,
  endMinute: 59,
  label: '',
}

// Referenzdatum: Ein bekannter Papa-Wochenende-Freitag
// 13. März 2026 = Papa-WE (WE MUK)
const PAPA_WEEKEND_REFERENCE = new Date(2026, 2, 13) // Monat 0-indexiert

/**
 * Bestimmt ob ein gegebener Freitag ein Papa- oder Mama-Wochenende ist
 */
export function isPapaWeekend(date: Date): boolean {
  // Finde den Freitag des Wochenendes zu dem dieses Datum gehört
  const d = new Date(date)
  const dayOfWeek = d.getDay()
  const friday = new Date(d)
  // Fr(5)→0, Sa(6)→-1, So(0)→-2 Tage zurück zum Freitag
  const offsetToFriday = dayOfWeek === 0 ? -2 : dayOfWeek === 6 ? -1 : 0
  friday.setDate(d.getDate() + offsetToFriday)
  friday.setHours(0, 0, 0, 0)

  const ref = new Date(PAPA_WEEKEND_REFERENCE)
  ref.setHours(0, 0, 0, 0)

  const diffMs = friday.getTime() - ref.getTime()
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))

  // Gerade Anzahl Wochen Differenz = Papa-WE, ungerade = Mama-WE
  return diffWeeks % 2 === 0
}

/**
 * Gibt den geplanten Betreuer für ein bestimmtes Datum zurück
 */
export function getScheduledCaregiver(date: Date): DaySchedule | null {
  const dayOfWeek = date.getDay() as DayOfWeek

  // Wochentage Mo-Do
  if (FIXED_WEEKDAYS[dayOfWeek]) {
    return FIXED_WEEKDAYS[dayOfWeek]!
  }

  // Wochenende Fr(5), Sa(6), So(0)
  if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
    const isPapa = isPapaWeekend(date)
    const caregiverId: CaregiverId = isPapa ? 'andreas' : 'jaie'
    return {
      ...WEEKEND_SCHEDULE,
      caregiverId,
      label: isPapa ? 'Papa-Wochenende' : 'Mama-Wochenende',
    }
  }

  return null
}
