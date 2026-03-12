import { useMemo } from 'react'
import { CareSession, CaregiverStats, CaregiverId } from '../types'
import { CAREGIVER_LIST } from '../config/caregivers'

export function useStats(sessions: CareSession[]): CaregiverStats[] {
  return useMemo(() => {
    const totals: Record<CaregiverId, { seconds: number; count: number }> = {
      jaie: { seconds: 0, count: 0 },
      andreas: { seconds: 0, count: 0 },
      gabi: { seconds: 0, count: 0 },
      jani: { seconds: 0, count: 0 },
    }

    for (const session of sessions) {
      const end = session.endTime ?? Date.now()
      const seconds = (end - session.startTime) / 1000
      totals[session.caregiverId].seconds += seconds
      totals[session.caregiverId].count += 1
    }

    const totalSecondsAll = Object.values(totals).reduce(
      (sum, t) => sum + t.seconds,
      0
    )

    return CAREGIVER_LIST.map((cg) => ({
      caregiverId: cg.id,
      totalSeconds: Math.round(totals[cg.id].seconds),
      sessionCount: totals[cg.id].count,
      percentageOfTotal:
        totalSecondsAll > 0
          ? Math.round((totals[cg.id].seconds / totalSecondsAll) * 100)
          : 0,
    })).sort((a, b) => b.totalSeconds - a.totalSeconds)
  }, [sessions])
}
