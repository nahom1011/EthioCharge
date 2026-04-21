import { useState, useEffect, useCallback } from 'react'
import MapView from '../components/Map/MapView'
import FilterPanel from '../components/Filter/FilterPanel'
import StationCard from '../components/Station/StationCard'
import { fetchStations } from '../api/stations'
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import './HomePage.css'

export default function HomePage() {
  const [stations,    setStations]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [selectedId,  setSelectedId]  = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filters, setFilters] = useState({
    search: '', station_type: '', status: '', charger_type: ''
  })

  const loadStations = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search)       params.search       = filters.search
      if (filters.station_type) params.station_type = filters.station_type
      if (filters.status)       params.status       = filters.status
      if (filters.charger_type) params.charger_type = filters.charger_type
      const { data } = await fetchStations(params)
      setStations(data.results ?? data)
    } catch (err) {
      console.error('Failed to load stations', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const t = setTimeout(loadStations, 300)   // debounce search
    return () => clearTimeout(t)
  }, [loadStations])

  return (
    <div className="home-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          stationCount={stations.length}
        />

        <div className="station-list">
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
              <span>Loading stations...</span>
            </div>
          ) : stations.length === 0 ? (
            <div className="empty-state">
              <span>🗺️</span>
              <p>No stations found</p>
              <small>Try adjusting your filters</small>
            </div>
          ) : (
            stations.map((s) => (
              <StationCard
                key={s.id}
                station={s}
                isSelected={s.id === selectedId}
                onClick={(id) => setSelectedId(id === selectedId ? null : id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Sidebar toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Map */}
      <div className="map-area">
        <MapView
          stations={stations}
          selectedId={selectedId}
          onLocationFound={({ latitude, longitude }) => {
            // Optionally load nearby stations
          }}
        />
      </div>
    </div>
  )
}
