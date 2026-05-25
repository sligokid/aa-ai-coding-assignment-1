import { createContext, useContext, useState, type ReactNode } from 'react'

type AdminRole = { type: 'admin' }
type MechanicRole = { type: 'mechanic'; mechanicId: number; mechanicName: string }
export type Role = AdminRole | MechanicRole

interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

function loadRole(): Role {
  try {
    const raw = localStorage.getItem('smr-role')
    if (raw) return JSON.parse(raw) as Role
  } catch {
    // ignore
  }
  return { type: 'admin' }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(loadRole)

  function setRole(next: Role) {
    setRoleState(next)
    localStorage.setItem('smr-role', JSON.stringify(next))
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
