import { useEffect, useState } from 'react'
import { SlotPicker } from '../components/SlotPicker'
import type { SlotDto, BranchDto, ServiceTypeDto } from '../components/SlotPicker'

interface BookingConfirmation {
  id: number
  referenceNumber: string
  customerName: string
  vehicleReg: string
  startTime: string
  mechanicName: string
  serviceTypeName: string
}

type View = 'picking' | 'booking' | 'confirmed'

const API = 'http://localhost:5000'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function BookingPage() {
  const [view, setView] = useState<View>('picking')
  const [slots, setSlots] = useState<SlotDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeDto[]>([])
  const [branchFilter, setBranchFilter] = useState<number | null>(null)
  const [serviceTypeFilter, setServiceTypeFilter] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null)
  const [slotTakenError, setSlotTakenError] = useState(false)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')
  const [serviceTypeId, setServiceTypeId] = useState<number | ''>('')
  const [notes, setNotes] = useState('')

  async function fetchSlots() {
    try {
      const res = await fetch(`${API}/api/slots`)
      setSlots(await res.json())
    } catch {
      // network error — leave stale
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const [slotsRes, branchesRes, stRes] = await Promise.all([
          fetch(`${API}/api/slots`),
          fetch(`${API}/api/branches`),
          fetch(`${API}/api/service-types`),
        ])
        const [slotsData, branchesData, stData] = await Promise.all([
          slotsRes.json(),
          branchesRes.json(),
          stRes.json(),
        ])
        setSlots(slotsData)
        setBranches(branchesData)
        setServiceTypes(stData)
      } catch {
        // network error
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  function handleSelectSlot(slot: SlotDto) {
    setSelectedSlot(slot)
    setServiceTypeId(serviceTypeFilter ?? '')
    setSlotTakenError(false)
    setView('booking')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot || serviceTypeId === '') return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          customerName,
          phone,
          vehicleReg,
          serviceTypeId: Number(serviceTypeId),
          notes: notes || null,
        }),
      })
      if (res.status === 409) {
        setSlotTakenError(true)
        setView('picking')
        await fetchSlots()
        return
      }
      if (!res.ok) return
      const data = await res.json()
      setConfirmation(data)
      setView('confirmed')
    } catch {
      // network error
    } finally {
      setSubmitting(false)
    }
  }

  function handleBookAnother() {
    setView('picking')
    setSelectedSlot(null)
    setConfirmation(null)
    setSlotTakenError(false)
    setCustomerName('')
    setPhone('')
    setVehicleReg('')
    setServiceTypeId('')
    setNotes('')
    fetchSlots()
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Loading available slots…</div>
  }

  if (view === 'confirmed' && confirmation) {
    return (
      <div className="max-w-lg mx-auto p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 font-bold text-xl mb-1">Booking Confirmed</div>
          <div className="text-3xl font-mono font-bold text-green-800 my-3">
            {confirmation.referenceNumber}
          </div>
          <dl className="text-sm text-left mt-4 space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-500">Customer</dt>
              <dd className="font-medium">{confirmation.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Vehicle reg</dt>
              <dd className="font-medium">{confirmation.vehicleReg}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Date &amp; time</dt>
              <dd className="font-medium">{formatDateTime(confirmation.startTime)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Mechanic</dt>
              <dd className="font-medium">{confirmation.mechanicName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Service</dt>
              <dd className="font-medium">{confirmation.serviceTypeName}</dd>
            </div>
          </dl>
        </div>
        <button
          onClick={handleBookAnother}
          className="mt-4 w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 font-medium"
        >
          Book Another
        </button>
      </div>
    )
  }

  if (view === 'booking' && selectedSlot) {
    return (
      <div className="max-w-lg mx-auto p-8">
        <button
          onClick={() => { setView('picking'); setSlotTakenError(false) }}
          className="text-blue-600 text-sm mb-4 hover:underline"
        >
          ← Back to slots
        </button>
        <h2 className="text-lg font-semibold mb-1">Book appointment</h2>
        <p className="text-sm text-gray-500 mb-4">
          {formatDateTime(selectedSlot.startTime)} · {selectedSlot.mechanicName} · {selectedSlot.branchName}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer name *</label>
            <input
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle reg *</label>
            <input
              required
              value={vehicleReg}
              onChange={e => setVehicleReg(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service type *</label>
            <select
              required
              value={serviceTypeId}
              onChange={e => setServiceTypeId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select service type</option>
              {serviceTypes.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-xl font-semibold mb-4">Book an appointment</h1>
      <SlotPicker
        slots={slots}
        branches={branches}
        serviceTypes={serviceTypes}
        branchFilter={branchFilter}
        serviceTypeId={serviceTypeFilter}
        slotTakenError={slotTakenError}
        onBranchFilterChange={setBranchFilter}
        onServiceTypeChange={setServiceTypeFilter}
        onSelectSlot={handleSelectSlot}
      />
    </div>
  )
}
