import { useState, useEffect } from 'react'

export function useElapsedTime(startTime: number | null): string {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (startTime === null) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [startTime])

  if (startTime === null) return ''

  const elapsed = Math.max(0, now - startTime)
  const totalMinutes = Math.floor(elapsed / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
