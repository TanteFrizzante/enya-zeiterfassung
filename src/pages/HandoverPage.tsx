import { CareSession } from '../types'
import { CAREGIVER_LIST } from '../config/caregivers'
import { CaregiverButton } from '../components/CaregiverButton'
import { ActiveTimer } from '../components/ActiveTimer'
import { CaregiverId } from '../types'

interface Props {
  activeSession: CareSession | null
  onHandover: (id: CaregiverId) => void
}

export function HandoverPage({ activeSession, onHandover }: Props) {
  return (
    <div className="flex flex-col h-full">
      <ActiveTimer session={activeSession} />

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
              onTap={() => onHandover(cg.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
