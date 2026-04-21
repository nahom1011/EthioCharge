import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Layout/Navbar'
import HomePage from './pages/HomePage'
import StationDetailPage from './pages/StationDetailPage'
import AddStationPage from './pages/AddStationPage'
import AuthPage from './pages/AuthPage'
import './App.css'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/stations/:id"  element={<StationDetailPage />} />
          <Route path="/add"           element={<AddStationPage />} />
          <Route path="/auth"          element={<AuthPage />} />
        </Routes>
      </main>
    </div>
  )
}
