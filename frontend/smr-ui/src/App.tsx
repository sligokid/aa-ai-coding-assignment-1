import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import { NavBar } from './components/NavBar'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<div className="p-8 text-gray-500">Booking — coming soon</div>} />
          <Route path="/mechanic" element={<div className="p-8 text-gray-500">Mechanic view — coming soon</div>} />
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  )
}
