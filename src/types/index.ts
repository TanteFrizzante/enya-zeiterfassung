export type CaregiverId = 'jaie' | 'andreas' | 'gabi' | 'jani'

export interface CaregiverDef {
  id: CaregiverId
  name: string
  role: string
  colorHex: string
  emoji: string
}

export interface CareSession {
  id: string
  caregiverId: CaregiverId
  startTime: number
  endTime: number | null
}

export type TabId = 'handover' | 'calendar' | 'stats'

export type StatsPeriod = 'week' | 'month'

export interface CaregiverStats {
  caregiverId: CaregiverId
  totalMinutes: number
  sessionCount: number
  percentageOfTotal: number
}
