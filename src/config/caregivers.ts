import { CaregiverDef, CaregiverId } from '../types'

export const CAREGIVERS: Record<CaregiverId, CaregiverDef> = {
  jaie: {
    id: 'jaie',
    name: 'Jaie',
    role: 'Mutter',
    colorHex: '#f43f5e',
    emoji: '\u{1F469}',
  },
  andreas: {
    id: 'andreas',
    name: 'Muk',
    role: 'Vater',
    colorHex: '#2563eb',
    emoji: '\u{1F468}',
  },
  gabi: {
    id: 'gabi',
    name: 'Gabi',
    role: 'Oma (v.)',
    colorHex: '#f59e0b',
    emoji: '\u{1F475}',
  },
  jani: {
    id: 'jani',
    name: 'Jani',
    role: 'Oma (m.)',
    colorHex: '#10b981',
    emoji: '\u{1F475}',
  },
}

export const CAREGIVER_LIST = Object.values(CAREGIVERS)

// Aktive Betreuer (ohne Gabi und Jani)
export const ACTIVE_CAREGIVER_IDS: CaregiverId[] = ['jaie', 'andreas']
export const ACTIVE_CAREGIVER_LIST = ACTIVE_CAREGIVER_IDS.map((id) => CAREGIVERS[id])
