import { useMemo } from 'react'
import { CareSession, CaregiverStats, CaregiverId } from '../types'
import { ACTIVE_CAREGIVER_LIST, ACTIVE_CAREGIVER_IDS } from '../config/caregivers'

export function useStats(sessions: CareSession[]): CaregiverStats[] {
  return useMemo(() => {
    const totals: Partial<Record<CaregiverId, { seconds: number; count: number }>> = {}
    for (const id of ACTIVE_CAREGIVER_IDS) {
      totals[id] = { seconds: 0, count: 0 }
    }

    for (const session of sessions) {
      if (!totals[session.caregiverId]) continue
      const end = session.endTime ?? Date.now()
      const seconds = (end - session.startTime) / 1000
      totals[session.caregiverId]!.seconds += seconds
      totals[session.caregiverId]!.count += 1
    }

    const totalSecondsAll = Object.values(totals).reduce(
      (sum, t) => sum + (t?.seconds ?? 0),
      0
    )

    return ACTIVE_CAREGIVER_LIST.map((cg) => ({
      caregiverId: cg.id,
      totalSeconds: Math.round(totals[cg.id]?.seconds ?? 0),
      sessionCount: totals[cg.id]?.count ?? 0,
      percentageOfTotal:
        totalSecondsAll > 0
          ? Math.round(((totals[cg.id]?.seconds ?? 0) / totalSecondsAll) * 100)
          : 0,
    })).sort((a, b) => b.totalSeconds - a.totalSeconds)
  }, [sessions])
}
