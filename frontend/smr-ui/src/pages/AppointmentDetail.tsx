import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'

type AppointmentStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow'

interface WorkNote {
  id: number
  content: string
  createdAt: string
}

interface AppointmentDetailData {
  id: number
  referenceNumber: string
  customerName: string
  phone: string
  vehicleReg: string
  serviceTypeName: string
  notes: string | null
  status: AppointmentStatus
  startTime: string
  workNotes: WorkNote[]
}

const headerBg: Record<AppointmentStatus, string> = {
  Scheduled:  'bg-blue-600',
  InProgress: 'bg-[#FFD100]',
  Completed:  'bg-emerald-600',
  NoShow:     'bg-gray-500',
}

const headerText: Record<AppointmentStatus, string> = {
  Scheduled:  'text-white',
  InProgress: 'text-black',
  Completed:  'text-white',
  NoShow:     'text-white',
}

const headerSubText: Record<AppointmentStatus, string> = {
  Scheduled:  'text-blue-100',
  InProgress: 'text-black/60',
  Completed:  'text-emerald-100',
  NoShow:     'text-gray-300',
}

export function AppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [appointment, setAppointment] = useState<AppointmentDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load appointment')
        return r.json() as Promise<AppointmentDetailData>
      })
      .then(data => { setAppointment(data); setLoading(false) })
      .catch(err => { setError((err as Error).message); setLoading(false) })
  }, [id])

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteContent.trim() || !appointment) return
    setSubmittingNote(true)
    try {
      const r = await fetch(`/api/appointments/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim() }),
      })
      if (!r.ok) throw new Error('Failed to add note')
      const note = await r.json() as WorkNote
      setAppointment(prev => prev ? { ...prev, workNotes: [...prev.workNotes, note] } : prev)
      setNoteContent('')
    } finally {
      setSubmittingNote(false)
    }
  }

  async function handleStatusUpdate(newStatus: AppointmentStatus) {
    if (!appointment) return
    setStatusUpdating(true)
    try {
      const r = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!r.ok) throw new Error('Failed to update status')
      setAppointment(prev => prev ? { ...prev, status: newStatus } : prev)
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading appointment…</div>
  )
  if (error || !appointment) return <p className="p-8 text-red-500">{error ?? 'Appointment not found.'}</p>

  const isTerminal = appointment.status === 'Completed' || appointment.status === 'NoShow'
  const startTime = new Date(appointment.startTime)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-5">
      <Link to="/mechanic" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        ← Back to schedule
      </Link>

      {/* Status header */}
      <div className={`rounded-xl p-5 ${headerBg[appointment.status]} ${headerText[appointment.status]}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${headerSubText[appointment.status]}`}>
              {appointment.referenceNumber}
            </p>
            <h1 className="text-2xl font-bold">{appointment.customerName}</h1>
            <p className={`text-sm mt-1 ${headerSubText[appointment.status]}`}>
              {startTime.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}
              {startTime.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {([
            ['Phone',   appointment.phone],
            ['Vehicle', appointment.vehicleReg],
            ['Service', appointment.serviceTypeName],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex items-center px-5 py-3.5">
              <span className="text-sm text-gray-400 w-24 flex-shrink-0">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
          {appointment.notes && (
            <div className="px-5 py-3.5">
              <span className="text-sm text-gray-400 block mb-1">Customer notes</span>
              <span className="text-sm text-gray-700">{appointment.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status actions */}
      {!isTerminal && (
        <div className="flex gap-3">
          {appointment.status === 'Scheduled' && (
            <button
              onClick={() => handleStatusUpdate('InProgress')}
              disabled={statusUpdating}
              className="px-5 py-2.5 bg-[#FFD100] text-black rounded-lg font-semibold text-sm hover:bg-yellow-400 disabled:opacity-50 transition-colors shadow-sm"
            >
              Start Job
            </button>
          )}
          {appointment.status === 'InProgress' && (
            <>
              <button
                onClick={() => handleStatusUpdate('Completed')}
                disabled={statusUpdating}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleStatusUpdate('NoShow')}
                disabled={statusUpdating}
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                No-Show
              </button>
            </>
          )}
        </div>
      )}

      {/* Work notes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Work Notes</h2>
        </div>
        <div className="px-5 py-4">
          {appointment.workNotes.length === 0 ? (
            <p className="text-sm text-gray-400">No notes yet.</p>
          ) : (
            <div className="space-y-4">
              {appointment.workNotes.map(note => (
                <div key={note.id} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-[#FFD100] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      {new Date(note.createdAt).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short', hour12: false })}
                    </p>
                    <p className="text-sm text-gray-800">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="Add a work note…"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent resize-none"
            />
            <button
              type="submit"
              disabled={submittingNote || !noteContent.trim()}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              Add Note
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
