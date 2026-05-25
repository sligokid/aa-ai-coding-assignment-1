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

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

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
      const res = await fetch(`/api/slots`)
      setSlots(await res.json())
    } catch {
      // leave stale
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const [slotsRes, branchesRes, stRes] = await Promise.all([
          fetch(`/api/slots`),
          fetch(`/api/branches`),
          fetch(`/api/service-types`),
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
      const res = await fetch(`/api/appointments`, {
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
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading available slots…</div>
  }

  if (view === 'confirmed' && confirmation) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#FFD100] px-6 py-5 flex flex-col items-center">
            <img src="/aa-logo.svg" alt="AA" className="h-10 mb-3" />
            <div className="font-bold text-black text-lg">Booking Confirmed</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-center mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Reference Number</p>
              <div className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
                {confirmation.referenceNumber}
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {([
                ['Customer',    confirmation.customerName],
                ['Vehicle reg', confirmation.vehicleReg],
                ['Date & time', formatDateTime(confirmation.startTime)],
                ['Mechanic',    confirmation.mechanicName],
                ['Service',     confirmation.serviceTypeName],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between py-2.5 text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 text-right ml-4">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 pb-6">
            <button
              onClick={handleBookAnother}
              className="w-full bg-black text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'booking' && selectedSlot) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <button
          onClick={() => { setView('picking'); setSlotTakenError(false) }}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          ← Back to slots
        </button>

        <div className="bg-[#FFD100] rounded-xl px-5 py-4 mb-6">
          <p className="font-bold text-black">{formatDateTime(selectedSlot.startTime)}</p>
          <p className="text-black/60 text-sm mt-0.5">{selectedSlot.mechanicName} · {selectedSlot.branchName}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
          <h2 className="font-semibold text-gray-900 mb-5">Customer details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Customer name *</label>
              <input required value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vehicle reg *</label>
              <input required value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Service type *</label>
              <select
                required
                value={serviceTypeId}
                onChange={e => setServiceTypeId(e.target.value ? Number(e.target.value) : '')}
                className={inputClass}
              >
                <option value="">Select service type</option>
                {serviceTypes.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors mt-2"
            >
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
        <p className="text-sm text-gray-500 mt-1">Select an available slot to get started</p>
      </div>
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
