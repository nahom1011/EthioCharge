import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import './FilterPanel.css'

const STATION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'ev',      label: '⚡ EV Charger' },
  { value: 'fuel',    label: '⛽ Fuel Station' },
  { value: 'garage',  label: '🔧 Garage' },
  { value: 'carwash', label: '🚿 Car Wash' },
  { value: 'service', label: '🚗 Car Service' },
]
const STATUSES = [
  { value: '', label: 'Any Status' },
  { value: 'available', label: '🟢 Available' },
  { value: 'busy',      label: '🟡 Busy' },
  { value: 'offline',   label: '🔴 Offline' },
]
const CHARGER_TYPES = [
  { value: '', label: 'Any Charger' },
  { value: 'fast', label: '⚡ Fast DC' },
  { value: 'slow', label: '🔌 Slow AC' },
]

export default function FilterPanel({ filters, onChange, stationCount }) {
  const [expanded, setExpanded] = useState(false)

  const set = (key, val) => onChange({ ...filters, [key]: val })

  const hasFilters = filters.station_type || filters.status || filters.charger_type || filters.search

  const clearAll = () => onChange({ search: '', station_type: '', status: '', charger_type: '' })

  return (
    <div className="filter-panel">
      {/* Search bar */}
      <div className="search-wrapper">
        <Search size={16} className="search-icon" />
        <input
          className="search-input input"
          type="text"
          placeholder="Search stations, cities..."
          value={filters.search || ''}
          onChange={(e) => set('search', e.target.value)}
        />
        {filters.search && (
          <button className="search-clear" onClick={() => set('search', '')}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <div className="filter-header">
        <button
          className={`filter-toggle ${expanded ? 'active' : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && <span className="filter-dot" />}
        </button>
        <span className="station-count">{stationCount} station{stationCount !== 1 ? 's' : ''}</span>
        {hasFilters && (
          <button className="clear-btn" onClick={clearAll}>Clear all</button>
        )}
      </div>

      {/* Expandable filters */}
      {expanded && (
        <div className="filter-grid">
          <div className="form-group">
            <label>Type</label>
            <select className="input" value={filters.station_type || ''} onChange={(e) => set('station_type', e.target.value)}>
              {STATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="input" value={filters.status || ''} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Charger</label>
            <select className="input" value={filters.charger_type || ''} onChange={(e) => set('charger_type', e.target.value)}>
              {CHARGER_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
