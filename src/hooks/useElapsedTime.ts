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
  const totalSeconds = Math.floor(elapsed / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${minutes}:${pad(seconds)}`
}
