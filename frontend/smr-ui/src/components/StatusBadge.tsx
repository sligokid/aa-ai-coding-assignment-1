type Status = 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow'

const colours: Record<Status, string> = {
  Scheduled:  'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  InProgress: 'bg-[#FFD100] text-black',
  Completed:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  NoShow:     'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200',
}

const labels: Record<Status, string> = {
  Scheduled:  'Scheduled',
  InProgress: 'In Progress',
  Completed:  'Completed',
  NoShow:     'No Show',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${colours[status]}`}>
      {labels[status]}
    </span>
  )
}
