import { StatusBadge } from './StatusBadge'

interface AppointmentCardProps {
  customerName: string
  vehicleReg: string
  serviceType: string
  startTime: string
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow'
}

export function AppointmentCard({ customerName, vehicleReg, serviceType, startTime, status }: AppointmentCardProps) {
  const time = new Date(startTime).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4">
      <div>
        <p className="font-semibold text-gray-900">{time} — {customerName}</p>
        <p className="text-sm text-gray-600">{vehicleReg} · {serviceType}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  )
}
