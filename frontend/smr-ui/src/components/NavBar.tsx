import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole, type Role } from '../context/RoleContext'

interface Mechanic {
  id: number
  name: string
  branchName: string
}

export function NavBar() {
  const { role, setRole } = useRole()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])

  useEffect(() => {
    fetch('http://localhost:5000/api/mechanics')
      .then(r => r.json())
      .then(setMechanics)
      .catch(() => {})
  }, [])

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === 'admin') {
      setRole({ type: 'admin' })
      return
    }
    const mechanic = mechanics.find(m => String(m.id) === val)
    if (mechanic) {
      const next: Role = { type: 'mechanic', mechanicId: mechanic.id, mechanicName: mechanic.name }
      setRole(next)
    }
  }

  const selectedValue = role.type === 'admin' ? 'admin' : String(role.mechanicId)

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">SMR Scheduler</span>
        <Link to="/" className="text-gray-300 hover:text-white text-sm">Home</Link>
        <Link to="/booking" className="text-gray-300 hover:text-white text-sm">Booking</Link>
        <Link to="/mechanic" className="text-gray-300 hover:text-white text-sm">Mechanic</Link>
      </div>
      <select
        value={selectedValue}
        onChange={handleRoleChange}
        className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
      >
        <option value="admin">Admin</option>
        {mechanics.map(m => (
          <option key={m.id} value={String(m.id)}>{m.name}</option>
        ))}
      </select>
    </nav>
  )
}
