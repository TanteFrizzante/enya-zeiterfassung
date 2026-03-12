import { CaregiverId, CareSession } from '../types'

const STORAGE_KEY = 'enya-sessions'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7)
}

function loadSessions(): CareSession[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function saveSessions(sessions: CareSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function getSessions(): CareSession[] {
  return loadSessions().sort((a, b) => a.startTime - b.startTime)
}

export function getActiveSession(): CareSession | null {
  const sessions = loadSessions()
  return sessions.find((s) => s.endTime === null) ?? null
}

export function startSession(caregiverId: CaregiverId): CareSession {
  const sessions = loadSessions()
  const now = Date.now()

  // End any active session
  const updated = sessions.map((s) =>
    s.endTime === null ? { ...s, endTime: now } : s
  )

  // Create new session
  const newSession: CareSession = {
    id: generateId(),
    caregiverId,
    startTime: now,
    endTime: null,
  }

  updated.push(newSession)
  saveSessions(updated)
  return newSession
}

export function endCurrentSession(): void {
  const sessions = loadSessions()
  const now = Date.now()
  const updated = sessions.map((s) =>
    s.endTime === null ? { ...s, endTime: now } : s
  )
  saveSessions(updated)
}

export function updateSession(
  sessionId: string,
  updates: Partial<Pick<CareSession, 'caregiverId' | 'startTime' | 'endTime'>>
): void {
  const sessions = loadSessions()
  const updated = sessions.map((s) =>
    s.id === sessionId ? { ...s, ...updates } : s
  )
  saveSessions(updated)
}

export function deleteSession(sessionId: string): void {
  const sessions = loadSessions()
  saveSessions(sessions.filter((s) => s.id !== sessionId))
}

export function getSessionsInRange(start: Date, end: Date): CareSession[] {
  const startMs = start.getTime()
  const endMs = end.getTime()
  return getSessions().filter((s) => {
    const sessionEnd = s.endTime ?? Date.now()
    return sessionEnd >= startMs && s.startTime <= endMs
  })
}
