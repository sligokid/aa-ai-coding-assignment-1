export interface SlotDto {
  id: number
  mechanicId: number
  mechanicName: string
  branchId: number
  branchName: string
  startTime: string
  durationMinutes: number
}

export interface BranchDto {
  id: number
  name: string
  address: string
}

export interface ServiceTypeDto {
  id: number
  name: string
}

interface SlotPickerProps {
  slots: SlotDto[]
  branches: BranchDto[]
  serviceTypes: ServiceTypeDto[]
  branchFilter: number | null
  serviceTypeId: number | null
  slotTakenError: boolean
  onBranchFilterChange: (id: number | null) => void
  onServiceTypeChange: (id: number | null) => void
  onSelectSlot: (slot: SlotDto) => void
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'short' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function SlotPicker({
  slots,
  branches,
  serviceTypes,
  branchFilter,
  serviceTypeId,
  slotTakenError,
  onBranchFilterChange,
  onServiceTypeChange,
  onSelectSlot,
}: SlotPickerProps) {
  const visible = branchFilter ? slots.filter(s => s.branchId === branchFilter) : slots

  const byDay = visible.reduce<Record<string, SlotDto[]>>((acc, s) => {
    const day = formatDay(s.startTime)
    ;(acc[day] ??= []).push(s)
    return acc
  }, {})

  const selectClass = 'border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent'

  return (
    <div className="space-y-5">
      {slotTakenError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          That slot was just taken. Please choose another.
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Branch</label>
          <select
            value={branchFilter ?? ''}
            onChange={e => onBranchFilterChange(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">All branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Service type</label>
          <select
            value={serviceTypeId ?? ''}
            onChange={e => onServiceTypeChange(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">Any service</option>
            {serviceTypes.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No available slots for the selected branch.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDay).map(([day, daySlots]) => (
            <div key={day}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{day}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {daySlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => onSelectSlot(slot)}
                    className="text-left bg-white border border-gray-100 rounded-lg p-3 hover:border-[#FFD100] hover:shadow-md transition-all shadow-sm group"
                  >
                    <div className="font-bold text-gray-900 text-sm group-hover:text-black">{formatTime(slot.startTime)}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{slot.mechanicName}</div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{slot.branchName}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
