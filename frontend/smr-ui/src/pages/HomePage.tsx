import { useEffect, useState } from 'react'
import { AppointmentCard } from '../components/AppointmentCard'

interface Appointment {
  id: number
  mechanicName: string
  customerName: string
  vehicleReg: string
  serviceTypeName: string
  startTime: string
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow'
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function HomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/appointments?date=today')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load appointments')
        return r.json() as Promise<Appointment[]>
      })
      .then(data => { setAppointments(data); setLoading(false) })
      .catch(err => { setError((err as Error).message); setLoading(false) })
  }, [])

  const today = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading today's schedule…</div>
  )
  if (error) return <p className="p-8 text-red-500">{error}</p>

  const byMechanic = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    ;(acc[a.mechanicName] ??= []).push(a)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Today's Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">{today}</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No appointments today</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byMechanic).map(([mechanic, appts]) => (
            <section key={mechanic}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-[#FFD100] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-black">{initials(mechanic)}</span>
                </div>
                <h2 className="font-semibold text-gray-800">{mechanic}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {appts.length} job{appts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2 pl-11">
                {appts.map(a => (
                  <AppointmentCard
                    key={a.id}
                    customerName={a.customerName}
                    vehicleReg={a.vehicleReg}
                    serviceType={a.serviceTypeName}
                    startTime={a.startTime}
                    status={a.status}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
