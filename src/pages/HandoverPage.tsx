import { CareSession } from '../types'
import { CAREGIVER_LIST, CAREGIVERS } from '../config/caregivers'
import { CaregiverButton } from '../components/CaregiverButton'
import { ActiveTimer } from '../components/ActiveTimer'
import { CaregiverId } from '../types'
import { getScheduledCaregiver } from '../config/schedule'

interface Props {
  activeSession: CareSession | null
  onHandover: (id: CaregiverId) => void
}

export function HandoverPage({ activeSession, onHandover }: Props) {
  const scheduled = getScheduledCaregiver(new Date())
  const scheduledCg = scheduled ? CAREGIVERS[scheduled.caregiverId] : null

  return (
    <div className="flex flex-col h-full">
      <ActiveTimer session={activeSession} />

      {/* Geplanter Betreuer laut Umgangsregelung */}
      {scheduledCg && !activeSession && (
        <div
          className="mx-4 mb-3 px-3 py-2 rounded-lg text-center text-sm"
          style={{
            backgroundColor: scheduledCg.colorHex + '15',
            color: scheduledCg.colorHex,
            border: `1px solid ${scheduledCg.colorHex}30`,
          }}
        >
          Laut Plan: <strong>{scheduledCg.name}</strong> ({scheduled!.label})
        </div>
      )}

      <div className="px-4 pb-4 flex-1">
        <p className="text-center text-gray-500 text-sm mb-4">
          Wer übernimmt Enya?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CAREGIVER_LIST.map((cg) => (
            <CaregiverButton
              key={cg.id}
              caregiver={cg}
              isActive={activeSession?.caregiverId === cg.id}
              isScheduled={scheduled?.caregiverId === cg.id}
              onTap={() => onHandover(cg.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
