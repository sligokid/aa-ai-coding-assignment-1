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

  if (loading) return <p className="p-8 text-gray-500">Loading today's schedule...</p>
  if (error) return <p className="p-8 text-red-500">{error}</p>

  if (appointments.length === 0) {
    return <p className="p-8 text-gray-500">No appointments today.</p>
  }

  const byMechanic = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    ;(acc[a.mechanicName] ??= []).push(a)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Today's Schedule</h1>
      <div className="space-y-8">
        {Object.entries(byMechanic).map(([mechanic, appts]) => (
          <section key={mechanic}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">{mechanic}</h2>
            <div className="space-y-2">
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
    </div>
  )
}
