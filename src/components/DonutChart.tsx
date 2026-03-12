import { CAREGIVERS } from '../config/caregivers'

interface DonutStat {
  caregiverId: string
  totalSeconds: number
  percentageOfTotal: number
}

interface Props {
  stats: DonutStat[]
  size?: 'sm' | 'lg'
}

export function DonutChart({ stats, size = 'lg' }: Props) {
  const jaie = stats.find((s) => s.caregiverId === 'jaie')
  const muk = stats.find((s) => s.caregiverId === 'andreas')
  const jaiePct = jaie?.percentageOfTotal ?? 0
  const mukPct = muk?.percentageOfTotal ?? 0
  const total = jaiePct + mukPct

  const outerSize = size === 'sm' ? 'w-28 h-28' : 'w-40 h-40'
  const innerSize = size === 'sm' ? 'w-16 h-16' : 'w-24 h-24'
  const bgClass = size === 'sm' ? 'bg-white' : 'bg-slate-50'

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center ${outerSize} mx-auto`}>
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ background: '#e5e7eb' }}
        >
          <div className={`${innerSize} rounded-full ${bgClass} flex items-center justify-center`}>
            <span className="text-gray-400 text-[10px]">Keine Daten</span>
          </div>
        </div>
      </div>
    )
  }

  const jaieColor = CAREGIVERS.jaie.colorHex
  const mukColor = CAREGIVERS.andreas.colorHex
  const jaieDeg = (jaiePct / 100) * 360

  return (
    <div className={`flex items-center justify-center ${outerSize} mx-auto`}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${jaieColor} 0deg ${jaieDeg}deg, ${mukColor} ${jaieDeg}deg 360deg)`,
        }}
      >
        <div className={`${innerSize} rounded-full ${bgClass} flex items-center justify-center flex-col`}>
          {size === 'sm' ? (
            <>
              <span className="text-[10px] text-gray-500 leading-tight">
                <span style={{ color: jaieColor }} className="font-bold">{jaiePct}%</span>
                {' / '}
                <span style={{ color: mukColor }} className="font-bold">{mukPct}%</span>
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500 font-medium">Verteilung</span>
          )}
        </div>
      </div>
    </div>
  )
}
