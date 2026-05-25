import { StatusBadge } from './StatusBadge'

type Status = 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow'

interface AppointmentCardProps {
  customerName: string
  vehicleReg: string
  serviceType: string
  startTime: string
  status: Status
}

const leftBorder: Record<Status, string> = {
  Scheduled:  'border-l-blue-400',
  InProgress: 'border-l-[#FFD100]',
  Completed:  'border-l-emerald-500',
  NoShow:     'border-l-gray-300',
}

export function AppointmentCard({ customerName, vehicleReg, serviceType, startTime, status }: AppointmentCardProps) {
  const time = new Date(startTime).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div className={`bg-white border border-gray-100 border-l-4 ${leftBorder[status]} rounded-lg px-4 py-3 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="text-center flex-shrink-0 w-12">
          <div className="text-base font-bold text-gray-900 tabular-nums leading-tight">{time}</div>
        </div>
        <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{customerName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{vehicleReg} · {serviceType}</p>
        </div>
      </div>
      <StatusBadge status={status} />
    </div>
  )
}
