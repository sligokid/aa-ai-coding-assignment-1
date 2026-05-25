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
    fetch(`/api/appointments?mechanicId=${mechanicId}&date=${date}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load appointments')
        return r.json() as Promise<Appointment[]>
      })
      .then(data => { setAppointments(data); setLoading(false) })
      .catch(err => { setError((err as Error).message); setLoading(false) })
  }, [mechanicId, date])

  return { appointments, loading, error }
}

function AppointmentSection({ title, accent, mechanicId, date }: {
  title: string
  accent: string
  mechanicId: number
  date: string
}) {
  const { appointments, loading, error } = useAppointments(mechanicId, date)

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-1.5 w-6 rounded-full ${accent}`} />
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {!loading && !error && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {appointments.length} job{appointments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {loading && <p className="text-gray-400 text-sm pl-9">Loading…</p>}
      {error && <p className="text-red-500 text-sm pl-9">{error}</p>}
      {!loading && !error && appointments.length === 0 && (
        <p className="text-gray-400 text-sm pl-9">No appointments.</p>
      )}
      <div className="space-y-2 pl-9">
        {appointments.map(a => (
          <Link key={a.id} to={`/mechanic/${a.id}`} className="block hover:opacity-90 transition-opacity">
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
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Please select a mechanic role from the menu above.
      </div>
    )
  }

  const todayISO = new Date().toISOString().slice(0, 10)
  const tomorrowISO = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{role.mechanicName}</h1>
        <p className="text-sm text-gray-500 mt-1">Your schedule</p>
      </div>
      <div className="space-y-10">
        <AppointmentSection title="Today" accent="bg-[#FFD100]" mechanicId={role.mechanicId} date={todayISO} />
        <AppointmentSection title="Tomorrow" accent="bg-blue-400" mechanicId={role.mechanicId} date={tomorrowISO} />
      </div>
    </div>
  )
}
