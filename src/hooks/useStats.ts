import { useMemo } from 'react'
import { CareSession, CaregiverStats, CaregiverId } from '../types'
import { CAREGIVER_LIST } from '../config/caregivers'

export function useStats(sessions: CareSession[]): CaregiverStats[] {
  return useMemo(() => {
    const totals: Record<CaregiverId, { minutes: number; count: number }> = {
      jaie: { minutes: 0, count: 0 },
      andreas: { minutes: 0, count: 0 },
      gabi: { minutes: 0, count: 0 },
      jani: { minutes: 0, count: 0 },
    }

    for (const session of sessions) {
      const end = session.endTime ?? Date.now()
      const minutes = (end - session.startTime) / 60000
      totals[session.caregiverId].minutes += minutes
      totals[session.caregiverId].count += 1
    }

    const totalMinutesAll = Object.values(totals).reduce(
      (sum, t) => sum + t.minutes,
      0
    )

    return CAREGIVER_LIST.map((cg) => ({
      caregiverId: cg.id,
      totalMinutes: Math.round(totals[cg.id].minutes),
      sessionCount: totals[cg.id].count,
      percentageOfTotal:
        totalMinutesAll > 0
          ? Math.round((totals[cg.id].minutes / totalMinutesAll) * 100)
          : 0,
    })).sort((a, b) => b.totalMinutes - a.totalMinutes)
  }, [sessions])
}
