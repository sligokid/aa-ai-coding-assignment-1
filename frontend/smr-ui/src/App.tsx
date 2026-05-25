import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import { NavBar } from './components/NavBar'
import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { MechanicPage } from './pages/MechanicPage'
import { AppointmentDetail } from './pages/AppointmentDetail'

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <NavBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/mechanic" element={<MechanicPage />} />
              <Route path="/mechanic/:id" element={<AppointmentDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RoleProvider>
  )
}
