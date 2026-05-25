type Status = 'Scheduled' | 'InProgress' | 'Completed' | 'NoShow'

const colours: Record<Status, string> = {
  Scheduled: 'bg-blue-100 text-blue-800',
  InProgress: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  NoShow: 'bg-gray-100 text-gray-600',
}

const labels: Record<Status, string> = {
  Scheduled: 'Scheduled',
  InProgress: 'In Progress',
  Completed: 'Completed',
  NoShow: 'No Show',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colours[status]}`}>
      {labels[status]}
    </span>
  )
}
