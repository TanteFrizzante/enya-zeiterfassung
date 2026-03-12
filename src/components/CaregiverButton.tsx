import { CaregiverDef } from '../types'

interface Props {
  caregiver: CaregiverDef
  isActive: boolean
  onTap: () => void
}

export function CaregiverButton({ caregiver, isActive, onTap }: Props) {
  return (
    <button
      onClick={onTap}
      className="relative flex flex-col items-center justify-center rounded-2xl p-4 min-h-[100px] transition-all duration-200 active:scale-95 select-none"
      style={{
        backgroundColor: caregiver.colorHex,
        opacity: isActive ? 1 : 0.7,
        boxShadow: isActive
          ? `0 0 0 4px white, 0 0 0 6px ${caregiver.colorHex}`
          : 'none',
      }}
    >
      <span className="text-3xl mb-1">{caregiver.emoji}</span>
      <span className="text-white font-bold text-lg">{caregiver.name}</span>
      <span className="text-white/80 text-sm">{caregiver.role}</span>
      {isActive && (
        <span className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-green-600 font-bold text-sm">
          ✓
        </span>
      )}
    </button>
  )
}
