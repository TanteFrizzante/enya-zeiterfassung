import { CareSession } from '../types'
import { CAREGIVERS } from '../config/caregivers'
import { useElapsedTime } from '../hooks/useElapsedTime'

interface Props {
  session: CareSession | null
}

export function ActiveTimer({ session }: Props) {
  const elapsed = useElapsedTime(session?.startTime ?? null)

  if (!session) {
    return (
      <div className="text-center py-6 px-4">
        <p className="text-gray-400 text-lg">Keine aktive Betreuung</p>
        <p className="text-gray-300 text-sm mt-1">
          Tippe auf einen Betreuer um zu starten
        </p>
      </div>
    )
  }

  const caregiver = CAREGIVERS[session.caregiverId]

  return (
    <div className="text-center py-6 px-4">
      <p className="text-gray-500 text-sm mb-1">Enya ist bei</p>
      <p className="text-2xl font-bold" style={{ color: caregiver.colorHex }}>
        {caregiver.emoji} {caregiver.name}
      </p>
      <p className="text-gray-500 text-sm">{caregiver.role}</p>
      <p className="text-4xl font-mono font-bold mt-3 text-gray-800">
        {elapsed}
      </p>
    </div>
  )
}
