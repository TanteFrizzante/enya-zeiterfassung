import { useState, useCallback } from 'react'
import { CaregiverId, CareSession } from '../types'
import * as sessionService from '../services/sessionService'

export function useActiveSession() {
  const [activeSession, setActiveSession] = useState<CareSession | null>(
    sessionService.getActiveSession
  )

  const handover = useCallback((caregiverId: CaregiverId) => {
    if (activeSession?.caregiverId === caregiverId) {
      sessionService.endCurrentSession()
      setActiveSession(null)
    } else {
      const session = sessionService.startSession(caregiverId)
      setActiveSession(session)
    }
  }, [activeSession])

  const refresh = useCallback(() => {
    setActiveSession(sessionService.getActiveSession())
  }, [])

  return { activeSession, handover, refresh }
}
