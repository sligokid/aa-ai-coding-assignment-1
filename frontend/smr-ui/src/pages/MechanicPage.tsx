import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppointmentCard } from '../components/AppointmentCard'
import { useRole } from '../context/RoleContext'

interface Appointment {
  id: number
  customerName: string
  vehicleReg: string
  serviceTypeName: string
  startTime: string
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow'
}

function useAppointments(mechanicId: number, date: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:5000/api/appointments?mechanicId=${mechanicId}&date=${date}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load appointments')
        return r.json() as Promise<Appointment[]>
      })
      .then(data => { setAppointments(data); setLoading(false) })
      .catch(err => { setError((err as Error).message); setLoading(false) })
  }, [mechanicId, date])

  return { appointments, loading, error }
}

function AppointmentSection({ title, mechanicId, date }: { title: string; mechanicId: number; date: string }) {
  const { appointments, loading, error } = useAppointments(mechanicId, date)

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">{title}</h2>
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && appointments.length === 0 && (
        <p className="text-gray-500 text-sm">No appointments.</p>
      )}
      <div className="space-y-2">
        {appointments.map(a => (
          <Link key={a.id} to={`/mechanic/${a.id}`} className="block hover:opacity-80 transition-opacity">
            <AppointmentCard
              customerName={a.customerName}
              vehicleReg={a.vehicleReg}
              serviceType={a.serviceTypeName}
              startTime={a.startTime}
              status={a.status}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function MechanicPage() {
  const { role } = useRole()

  if (role.type !== 'mechanic') {
    return <p className="p-8 text-gray-500">Please select a mechanic role.</p>
  }

  const todayISO = new Date().toISOString().slice(0, 10)
  const tomorrowISO = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{role.mechanicName}'s Schedule</h1>
      <div className="space-y-8">
        <AppointmentSection title="Today" mechanicId={role.mechanicId} date={todayISO} />
        <AppointmentSection title="Tomorrow" mechanicId={role.mechanicId} date={tomorrowISO} />
      </div>
    </div>
  )
}
