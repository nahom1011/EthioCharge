import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import { createStation } from '../api/stations'
import { useAuth } from '../context/AuthContext'
import { markerHtml } from '../utils/stationUtils'
import { MapPin, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import './AddStationPage.css'

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition(e.latlng) }
  })
  if (!position) return null
  const icon = L.divIcon({
    html: markerHtml('ev', 'available'),
    className: '', iconSize: [38, 38], iconAnchor: [19, 38],
  })
  return <Marker position={position} icon={icon} />
}

const ADDIS_CENTER = [9.03, 38.74]

export default function AddStationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [position,    setPosition]    = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [form, setForm] = useState({
    name: '', station_type: 'ev', charger_type: 'fast',
    status: 'available', description: '', address: '', city: 'Addis Ababa', phone: ''
  })

  useEffect(() => {
    if (!user) { toast.error('Please sign in first'); navigate('/auth') }
  }, [user, navigate])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!position) return toast.error('Please click the map to set a location')
    setSubmitting(true)
    try {
      const { data } = await createStation({
        ...form,
        latitude:  position.lat.toFixed(7),
        longitude: position.lng.toFixed(7),
      })
      toast.success('Station added successfully!')
      navigate(`/stations/${data.id}`)
    } catch (err) {
      const detail = err.response?.data
      const msg = typeof detail === 'string' ? detail : 'Failed to add station'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="add-page">
      <div className="add-scroll">
        <div className="add-header">
          <div className="add-header-icon"><Plus size={22} /></div>
          <div>
            <h1>Add a Station</h1>
            <p>Help the community by adding a new location</p>
          </div>
        </div>

        <div className="add-layout">
          {/* Form */}
          <form className="add-form card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Station Name *</label>
              <input className="input" placeholder="e.g. Bole EV Hub" required
                value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select className="input" value={form.station_type} onChange={(e) => set('station_type', e.target.value)}>
                  <option value="ev">⚡ EV Charger</option>
                  <option value="fuel">⛽ Fuel Station</option>
                  <option value="garage">🔧 Garage</option>
                  <option value="carwash">🚿 Car Wash</option>
                  <option value="service">🚗 Car Service</option>
                </select>
              </div>

              {form.station_type === 'ev' && (
                <div className="form-group">
                  <label>Charger Type</label>
                  <select className="input" value={form.charger_type} onChange={(e) => set('charger_type', e.target.value)}>
                    <option value="fast">⚡ Fast DC</option>
                    <option value="slow">🔌 Slow AC</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="available">🟢 Available</option>
                  <option value="busy">🟡 Busy</option>
                  <option value="offline">🔴 Offline</option>
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <input className="input" placeholder="Addis Ababa"
                  value={form.city} onChange={(e) => set('city', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input className="input" placeholder="Street or neighbourhood"
                value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Phone (optional)</label>
              <input className="input" placeholder="+251..."
                value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="input" rows={3} placeholder="Opening hours, notes..."
                value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>

            {/* Coordinates display */}
            {position ? (
              <div className="coords-display">
                <MapPin size={14} />
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </div>
            ) : (
              <p className="coords-hint">👆 Click on the map to drop a pin</p>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
              {submitting ? 'Adding station...' : '+ Add Station'}
            </button>
          </form>

          {/* Map picker */}
          <div className="map-picker-wrapper">
            <div className="map-picker-label">
              <MapPin size={14} /> Click anywhere on the map to set location
            </div>
            <div className="map-picker-container">
              <MapContainer
                center={ADDIS_CENTER}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                cursor="crosshair"
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Satellite">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="White Map">
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution="© OpenStreetMap © CARTO"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
