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

function formatSlotTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
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

  return (
    <div className="space-y-4">
      {slotTakenError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          This slot was just taken. Please choose another.
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select
            value={branchFilter ?? ''}
            onChange={e => onBranchFilterChange(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">All branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service type</label>
          <select
            value={serviceTypeId ?? ''}
            onChange={e => onServiceTypeChange(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">Any service</option>
            {serviceTypes.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">No available slots for the selected branch.</p>
      ) : (
        <div className="grid gap-2">
          {visible.map(slot => (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className="text-left border border-gray-200 rounded p-3 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-sm">{formatSlotTime(slot.startTime)}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {slot.mechanicName} · {slot.branchName} · {slot.durationMinutes} min
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
