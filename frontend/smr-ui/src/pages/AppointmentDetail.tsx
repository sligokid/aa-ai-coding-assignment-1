import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

export function AppointmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [appointment, setAppointment] = useState<AppointmentDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:5000/api/appointments/${id}`)
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
      const r = await fetch(`http://localhost:5000/api/appointments/${id}/notes`, {
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
      const r = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
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

  if (loading) return <p className="p-8 text-gray-500">Loading appointment...</p>
  if (error || !appointment) return <p className="p-8 text-red-500">{error ?? 'Appointment not found.'}</p>

  const isTerminal = appointment.status === 'Completed' || appointment.status === 'NoShow'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{appointment.customerName}</h1>
          <p className="text-sm text-gray-500">{appointment.referenceNumber}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium">{appointment.phone}</span>
          <span className="text-gray-500">Vehicle</span>
          <span className="font-medium">{appointment.vehicleReg}</span>
          <span className="text-gray-500">Service</span>
          <span className="font-medium">{appointment.serviceTypeName}</span>
          <span className="text-gray-500">Time</span>
          <span className="font-medium">
            {new Date(appointment.startTime).toLocaleString('en-IE', {
              dateStyle: 'medium',
              timeStyle: 'short',
              hour12: false,
            })}
          </span>
        </div>
        {appointment.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500 mb-1">Customer notes</p>
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
      </div>

      {!isTerminal && (
        <div className="flex gap-3">
          {appointment.status === 'Scheduled' && (
            <button
              onClick={() => handleStatusUpdate('InProgress')}
              disabled={statusUpdating}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50"
            >
              Start Job
            </button>
          )}
          {appointment.status === 'InProgress' && (
            <>
              <button
                onClick={() => handleStatusUpdate('Completed')}
                disabled={statusUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Complete
              </button>
              <button
                onClick={() => handleStatusUpdate('NoShow')}
                disabled={statusUpdating}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
              >
                No-Show
              </button>
            </>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Work Notes</h2>
        {appointment.workNotes.length === 0 ? (
          <p className="text-sm text-gray-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {appointment.workNotes.map(note => (
              <li key={note.id} className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(note.createdAt).toLocaleString('en-IE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    hour12: false,
                  })}
                </p>
                <p className="text-sm">{note.content}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddNote} className="mt-4 space-y-2">
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Add a work note..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={submittingNote || !noteContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Add Note
          </button>
        </form>
      </div>
    </div>
  )
}
