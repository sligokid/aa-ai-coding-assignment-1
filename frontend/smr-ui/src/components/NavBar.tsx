import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRole, type Role } from '../context/RoleContext'

interface Mechanic {
  id: number
  name: string
  branchName: string
}

export function NavBar() {
  const { role, setRole } = useRole()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const location = useLocation()

  useEffect(() => {
    fetch('/api/mechanics')
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

  function navLink(to: string, label: string) {
    const active = to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(to)
    return (
      <Link
        to={to}
        className={`px-4 h-full flex items-center text-sm font-medium border-b-2 transition-colors ${
          active
            ? 'text-white border-[#FFD100]'
            : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="px-6 flex items-center justify-between h-14">
        <div className="flex items-center h-full gap-6">
          <Link to="/" className="flex items-center gap-3 mr-4 flex-shrink-0">
            <img src="/aa-logo.svg" alt="AA" className="h-8 w-auto" />
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 hidden sm:block">
              SMR Scheduler
            </span>
          </Link>
          <div className="flex items-center h-full">
            {navLink('/', 'Dashboard')}
            {navLink('/booking', 'New Booking')}
            {navLink('/mechanic', 'My Jobs')}
          </div>
        </div>
        <select
          value={selectedValue}
          onChange={handleRoleChange}
          className="bg-gray-900 text-white text-sm rounded px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-[#FFD100] cursor-pointer"
        >
          <option value="admin">Admin</option>
          {mechanics.map(m => (
            <option key={m.id} value={String(m.id)}>{m.name}</option>
          ))}
        </select>
      </div>
    </nav>
  )
}
